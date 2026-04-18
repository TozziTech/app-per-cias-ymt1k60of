import pb from '@/lib/pocketbase/client'

export async function logFormErrors(formId: string, errors: Record<string, any>, _userId?: string) {
  try {
    const promises = Object.entries(errors).map(([field, error]) => {
      if (!error) return Promise.resolve()

      let errorType = 'unknown_error'
      if (typeof error === 'string') errorType = error
      else if (error.type) errorType = error.type
      else if (error.message) errorType = error.message

      return pb.collection('error_logs').create({
        user: pb.authStore.record?.id || null, // Relation to _pb_users_auth_
        form_id: formId,
        field_name: field,
        error_type: errorType,
      })
    })

    await Promise.all(promises)
  } catch (err) {
    console.error('Failed to log form errors to PocketBase', err)
  }
}
