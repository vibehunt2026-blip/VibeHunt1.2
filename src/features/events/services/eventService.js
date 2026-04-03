import { supabase } from '../../../services/api'

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')

  if (error) throw error
  return data
}