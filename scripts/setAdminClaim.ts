// Script to set Firebase Custom Claims via the Admin API
import { getFirebaseAdmin } from '../src/firebase/admin';

async function setAdminClaim(uid: string, claims: Record<string, boolean>) {
  try {
    if (!uid) {
        throw new Error('UID is required');
    }
    const admin = getFirebaseAdmin();
    console.log(`Setting custom claims for user ${uid}:`, claims);
    
    await admin.auth.setCustomUserClaims(uid, claims);
    
    // Verify it worked
    const user = await admin.auth.getUser(uid);
    console.log('Successfully set claims. Current claims:', user.customClaims);
  } catch (error: any) {
    console.error('Error setting custom claims:', error.message);
    process.exit(1);
  }
}

// Example usage if run directly
// Run with: npx tsx scripts/setAdminClaim.ts <USER_UID>
if (typeof require !== 'undefined' && require.main === module) {
  const uid = process.argv[2];
  if (uid) {
    // Default example claims
    setAdminClaim(uid, {
      admin: true,
      moderator: true,
      teacher: false,
      premium: true
    }).then(() => process.exit(0));
  } else {
    console.error('Usage: tsx scripts/setAdminClaim.ts <uid>');
  }
}

export { setAdminClaim };
