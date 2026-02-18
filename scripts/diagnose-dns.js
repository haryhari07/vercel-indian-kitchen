
const dns = require('dns').promises;

async function diagnoseDNS() {
    const srvRecord = '_mongodb._tcp.cluster0.bs4df1i.mongodb.net';
    const host = 'cluster0.bs4df1i.mongodb.net';

    console.log('--- DEEP DNS DIAGNOSTIC ---');
    
    try {
        console.log(`\n1. Resolving SRV record for: ${srvRecord}...`);
        const addresses = await dns.resolveSrv(srvRecord);
        console.log('✅ SRV Resolution SUCCESS:', JSON.stringify(addresses, null, 2));
    } catch (err) {
        console.error('❌ SRV Resolution FAILED:', err.code, err.message);
    }

    try {
        console.log(`\n2. Resolving TXT record for: ${host}...`);
        const txt = await dns.resolveTxt(host);
        console.log('✅ TXT Resolution SUCCESS:', JSON.stringify(txt, null, 2));
    } catch (err) {
        console.error('❌ TXT Resolution FAILED:', err.code, err.message);
    }

    try {
        console.log(`\n3. Resolving A record (IP) for: ${host}...`);
        const ips = await dns.resolve4(host);
        console.log('✅ A Record SUCCESS:', ips);
    } catch (err) {
        console.error('❌ A Record FAILED:', err.code, err.message);
        console.log('   (Note: Atlas cluster hosts usually only have SRV records, not direct A records)');
    }

    console.log('\n--- NETWORK SUGGESTION ---');
    console.log('If SRV fails but you can browse the web, your DNS (ISP) is likely blocking MongoDB Atlas.');
    console.log('Try changing your computer DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare).');
}

diagnoseDNS();
