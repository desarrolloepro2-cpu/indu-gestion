import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vullcfwwomtfaefbfrjq.supabase.co'
const supabaseServiceKey = 'sb_publishable_WkVN6WSY3EDYV2pBiLp0LQ_4_imHFCY' // This is anon key, usually needed for signup

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@staffcontrol.com',
    password: 'AndiS1627.',
  })

  if (error) {
    console.error('Error creating admin:', error.message)
  } else {
    console.log('Admin created successfully:', data.user?.id)
    
    // Also create the profile and the 'Supervisor' role link if needed
    // But first we need the role ID for Administrator
    const { data: roleData } = await supabase.from('roles').select('id').eq('nombre_rol', 'Administrador').single()
    
    if (roleData && data.user) {
      const { error: profileError } = await supabase.from('perfiles').insert([
        { id: data.user.id, id_rol: roleData.id }
      ])
      if (profileError) console.error('Error creating profile:', profileError.message)
    }
  }
}

createAdmin()
