import { supabase } from '../../../services/api'

export const checkIn = async (userId, eventId) => {
  const { error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      event_id: eventId
    })

  if (error) throw error
}