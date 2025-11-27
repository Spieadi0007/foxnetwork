import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createAdminClient } from '@/lib/supabase/server-client'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const flow = requestUrl.searchParams.get('flow') // 'signup' or 'signin'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    // We need to create the final redirect response first, then set cookies on it
    // Start with a default redirect URL that we'll update later
    let redirectUrl = `${requestUrl.origin}/dashboard`

    // Create a redirect response that we'll use to capture cookies
    const response = NextResponse.redirect(redirectUrl)
    const supabase = createRouteHandlerClient(request, response)

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        `${requestUrl.origin}/sign-in?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Check if this is a new user (sign-up) or existing user (sign-in)
    const createdAt = new Date(data.user?.created_at || '').getTime()
    const lastSignInAt = new Date(data.user?.last_sign_in_at || '').getTime()
    const timeDiff = Math.abs(createdAt - lastSignInAt)

    // If timestamps are within 2 seconds of each other, consider it a new user
    const isNewUser = timeDiff < 2000

    // Debug logging
    console.log('Auth Debug:', {
      email: data.user?.email,
      created_at: data.user?.created_at,
      last_sign_in_at: data.user?.last_sign_in_at,
      timeDiff,
      isNewUser,
      flow
    })

    // Determine the redirect URL based on the flow
    if (flow === 'signup' && !isNewUser) {
      // If user came from sign-up page but already has an account
      const userName = data.user?.user_metadata?.full_name?.split(' ')[0] || 'there'
      const message = `Hey ${userName}! Looks like you already have an account with us. Welcome back! 👋`
      redirectUrl = `${requestUrl.origin}/sign-in?info=${encodeURIComponent(message)}`
    } else if (flow === 'signin' && isNewUser) {
      // If user came from sign-in page but doesn't have an account yet
      // Delete the account that was just created
      const userId = data.user?.id

      if (userId) {
        try {
          // Delete the user using admin client
          const adminClient = createAdminClient()
          console.log('Attempting to delete user:', userId)
          const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

          if (deleteError) {
            console.error('Error deleting user:', deleteError)
          } else {
            console.log('User deleted successfully:', userId)
          }
        } catch (error) {
          console.error('Exception deleting user:', error)
        }
      }

      const userName = data.user?.user_metadata?.full_name?.split(' ')[0] || 'there'
      const message = `Hi ${userName}! We don't have an account for you yet. Would you like to create one?`
      redirectUrl = `${requestUrl.origin}/sign-up?info=${encodeURIComponent(message)}`
    } else if (isNewUser) {
      // New user from sign-up page - redirect to onboarding
      redirectUrl = `${requestUrl.origin}/onboarding`
    } else {
      // Existing user - check company type to redirect to correct portal
      const adminClient = createAdminClient()

      // First get the user's company_id
      const { data: userData, error: userError } = await adminClient
        .from('users')
        .select('*, company_id')
        .eq('id', data.user?.id)
        .single()

      console.log('User data check:', {
        userId: data.user?.id,
        companyId: userData?.company_id,
        userError: userError?.message
      })

      // Always redirect to /dashboard - the layout will show appropriate UI based on company type
      redirectUrl = `${requestUrl.origin}/dashboard`
    }

    // Create final redirect response with the correct URL but preserving cookies
    // The cookies were already set on 'response' by the supabase client during exchangeCodeForSession
    const finalResponse = NextResponse.redirect(redirectUrl)

    // Copy all cookies from the original response to the final response
    response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })

    return finalResponse
  }

  // No code or error, redirect to home
  return NextResponse.redirect(requestUrl.origin)
}
