'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { states } from '@/data/recipes';

// SVG Icons for better visual hierarchy
const Icons = {
  Check: () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Upload: () => <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Time: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function NewRecipePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    state: '',
    region: '',
    prepTime: '',
    cookTime: '',
    servings: 4,
    description: '',
    imageUrl: '',
    dietary: [] as string[],
  });

  const [ingredients, setIngredients] = useState([{ item: '', quantity: '' }]);
  const [instructions, setInstructions] = useState(['']);

  const dietaryOptions = [
    { label: '🌿 Vegetarian', value: 'Vegetarian' },
    { label: '🔴 Non-Vegetarian', value: 'Non-Vegetarian' },
    { label: '🌿 Gluten-Free', value: 'Gluten-Free' },
    { label: '🌿 Vegan', value: 'Vegan' },
    { label: '🥛 Dairy-Free', value: 'Dairy-Free' }
  ];

  // Auth check
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Auto-fill region
  useEffect(() => {
    if (formData.state) {
      const selectedState = states.find(s => s.name === formData.state);
      if (selectedState) {
        setFormData(prev => ({ ...prev, region: selectedState.region }));
      }
    }
  }, [formData.state]);

  // Auto-slug
  useEffect(() => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  }, [formData.title]);

  const handleIngredientChange = (index: number, field: 'item' | 'quantity', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, { item: '', quantity: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));

  const toggleDietary = (tag: string) => {
    setFormData(prev => {
      const newDietary = prev.dietary.includes(tag)
        ? prev.dietary.filter(t => t !== tag)
        : [...prev.dietary, tag];
      return { ...prev, dietary: newDietary };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed details:', res.status, errorText);
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
      }

      const json = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: json.url }));
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      console.error('Image upload failed', error);
      setUploadStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert('Please fill in all required fields and upload an image.');
      return;
    }

    setSubmitting(true);

    try {
      const recipeData = {
        ...formData,
        ingredients: ingredients.filter(i => i.item && i.quantity),
        instructions: instructions.filter(i => i),
      };

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (res.ok) {
        setSuccessMessage('Recipe published successfully! Redirecting...');
        setTimeout(() => router.push('/admin/recipes'), 1500);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create recipe');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit recipe');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create New Recipe</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? 'Publishing...' : 'Publish Recipe'}
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 border border-green-200">
            <Icons.Check />
            {successMessage}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Basic Info */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us the story behind this dish.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabadi Chicken Biryani"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-4"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State Origin <span className="text-red-500">*</span></label>
                    <select
                      required
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.slug} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (Auto-generated)</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 shadow-sm py-2.5 px-4 cursor-not-allowed"
                      value={formData.slug}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the flavors, textures, and cultural significance..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* 2. Ingredients */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
                  <p className="text-sm text-gray-500 mt-1">List everything needed for this dish.</p>
                </div>
                <button type="button" onClick={addIngredient} className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Icons.Plus /> Add Item
                </button>
              </div>
              <div className="p-6 space-y-3">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-4 items-start group animate-fadeIn">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Ingredient name (e.g. Basmati Rice)"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        value={ing.item}
                        onChange={e => handleIngredientChange(idx, 'item', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="text"
                        placeholder="Qty"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        value={ing.quantity}
                        onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeIngredient(idx)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Ingredient"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Instructions */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
                  <p className="text-sm text-gray-500 mt-1">Step-by-step guide to perfection.</p>
                </div>
                <button type="button" onClick={addInstruction} className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Icons.Plus /> Add Step
                </button>
              </div>
              <div className="p-6 space-y-4">
                {instructions.map((inst, idx) => (
                  <div key={idx} className="flex gap-4 items-start group animate-fadeIn">
                    <div className="mt-2 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <textarea
                      rows={2}
                      placeholder={`Describe step ${idx + 1}...`}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      value={inst}
                      onChange={e => handleInstructionChange(idx, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeInstruction(idx)} 
                      className="p-2 mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Step"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            
            {/* Image Upload */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Recipe Image <span className="text-red-500">*</span></h3>
              </div>
              <div className="p-6">
                <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  uploadStatus === 'uploading' ? 'border-orange-400 bg-orange-50' : 
                  uploadStatus === 'success' ? 'border-green-500 bg-green-50' :
                  'border-gray-300 hover:border-orange-500 hover:bg-gray-50'
                }`}>
                  
                  {formData.imageUrl ? (
                    <div className="w-full relative group">
                      <div className="aspect-w-16 aspect-h-12 w-full rounded-lg overflow-hidden bg-gray-100 mb-4 shadow-sm relative">
                        <Image 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1 mb-2">
                        <Icons.Check /> Image ready
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icons.Upload />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or WEBP</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadStatus === 'uploading'}
                  />
                  
                  {uploadStatus === 'uploading' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Hidden URL input for form submission, visible for debugging/manual entry if needed */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Image URL</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.imageUrl}
                    className="mt-1 w-full text-xs text-gray-500 bg-gray-50 border-none rounded focus:ring-0 cursor-text"
                    placeholder="Upload an image above"
                  />
                </div>
              </div>
            </section>

            {/* Meta Data */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Cooking Details</h3>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Icons.Time /> Prep Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.prepTime}
                    onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Icons.Time /> Cook Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 mins"
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.cookTime}
                    onChange={e => setFormData({ ...formData, cookTime: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Icons.User /> Servings
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.servings}
                    onChange={e => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </section>

            {/* Dietary Tags */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Dietary Tags</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dietaryOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-orange-50 rounded-lg transition-colors -mx-2 px-2">
                      <input
                        type="checkbox"
                        checked={formData.dietary.includes(option.value)}
                        onChange={() => toggleDietary(option.value)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition duration-150 ease-in-out"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </form>
      </div>
    </div>
  );
}