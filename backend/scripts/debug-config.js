require('dotenv').config();

console.log('🔍 Diagnostic de la configuration de la base de données');
console.log('==================================================');

// Afficher les variables d'environnement (sans les mots de passe)
console.log('Variables d\'environnement :');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('- DB_HOST:', process.env.DB_HOST || 'non défini');
console.log('- DB_PORT:', process.env.DB_PORT || 'non défini');
console.log('- DB_USER:', process.env.DB_USER || 'non défini');
console.log('- DB_NAME:', process.env.DB_NAME || 'non défini');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***défini***' : 'non défini');
console.log('- PORT:', process.env.PORT || 'non défini');

// Vérifier si les variables essentielles sont présentes
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Variables manquantes :', missingVars.join(', '));
} else {
  console.log('\n✅ Toutes les variables requises sont présentes');
}

// Tester la résolution DNS
const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);

async function testDNS() {
  if (process.env.DB_HOST) {
    try {
      console.log('\n🔍 Test de résolution DNS pour', process.env.DB_HOST);
      const addresses = await resolve4(process.env.DB_HOST);
      console.log('✅ DNS résolu vers:', addresses);
    } catch (error) {
      console.log('❌ Erreur de résolution DNS:', error.message);
    }
  }
}

testDNS(); 