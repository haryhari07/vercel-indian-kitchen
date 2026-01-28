export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Indian Kitchen. All rights reserved.</p>
        <p className="mt-2 text-sm">Celebrating the diversity of Indian Cuisine.</p>
      </div>
    </footer>
  );
}
