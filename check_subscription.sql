SELECT 
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_status,
  plan,
  current_period_end
FROM subscriptions 
WHERE user_id = 'cmoododq80002s0lap07hzz07';
