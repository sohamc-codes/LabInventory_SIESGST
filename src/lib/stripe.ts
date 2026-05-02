// Stripe integration utilities
// Install: npm install stripe @stripe/stripe-js

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables')
    }
    
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  
  return stripeInstance
}

export const stripe = {
  get checkout() {
    return getStripeInstance().checkout
  },
  get billingPortal() {
    return getStripeInstance().billingPortal
  },
  get webhooks() {
    return getStripeInstance().webhooks
  }
}

export const PLANS = {
  STARTER: {
    name: 'Starter',
    price: 0,
    priceId: null,
    maxUsers: 50,
    maxComponents: 500,
    features: [
      'Up to 500 components',
      'Up to 50 users',
      'Basic analytics',
      'Email support',
      'QR code generation',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 99,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    maxUsers: 500,
    maxComponents: 5000,
    features: [
      'Up to 5,000 components',
      'Up to 500 users',
      'Advanced analytics',
      'Priority support',
      'AI recommendations',
      'Custom workflows',
      'API access',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null,
    priceId: null,
    maxUsers: 999999,
    maxComponents: 999999,
    features: [
      'Unlimited components',
      'Unlimited users',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
      'Custom training',
    ],
  },
}

export async function createCheckoutSession({
  organizationId,
  plan,
  successUrl,
  cancelUrl,
}: {
  organizationId: string
  plan: keyof typeof PLANS
  successUrl: string
  cancelUrl: string
}) {
  const planDetails = PLANS[plan]
  
  if (!planDetails.priceId) {
    throw new Error('Invalid plan or price ID not configured')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planDetails.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organizationId,
      plan,
    },
  })

  return session
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription
      const session = event.data.object as Stripe.Checkout.Session
      // Update organization with subscription details
      break

    case 'customer.subscription.updated':
      // Handle subscription changes
      break

    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break

    case 'invoice.payment_succeeded':
      // Handle successful payment
      break

    case 'invoice.payment_failed':
      // Handle failed payment
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}
