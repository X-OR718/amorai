# 🚀 AMORAI DEPLOYMENT GUIDE
## Go Live with Payments in 1 Hour

---

# WHAT YOU HAVE NOW

✅ Sofia V3 with:
- Real photos
- Memory (remembers conversations)
- Voice (she speaks)
- Enhanced personality
- Settings panel
- User profiles
- Statistics

---

# STEP 1: PREPARE FILES (5 minutes)

## Rename for deployment:
1. Rename `sofia-v3.html` to `index.html`
2. Your folder should look like:
```
amorai-v3/
├── index.html      (renamed from sofia-v3.html)
└── images/
    ├── sofia-closeup.png
    ├── sofia-coffee.png
    └── ... (all images)
```

## Add your API key:
1. Open `index.html` in Notepad
2. Find line ~15: `const OPENAI_API_KEY = 'sk-YOUR-OPENAI-API-KEY-HERE';`
3. Add your OpenAI key
4. Save

---

# STEP 2: CREATE GITHUB ACCOUNT (5 minutes)

1. Go to: https://github.com
2. Click "Sign up"
3. Enter email, create password
4. Verify email
5. Done!

---

# STEP 3: UPLOAD TO GITHUB (10 minutes)

1. Log into GitHub
2. Click the "+" icon (top right) → "New repository"
3. Name: `amorai`
4. Select: **Public**
5. Click "Create repository"
6. Click "uploading an existing file"
7. Drag your ENTIRE `amorai-v3` folder contents (index.html + images folder)
8. Click "Commit changes"
9. Done! Your code is on GitHub

---

# STEP 4: DEPLOY TO VERCEL (10 minutes)

1. Go to: https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access GitHub
4. Click "Add New Project"
5. Find and select your `amorai` repository
6. Click "Deploy"
7. Wait 1-2 minutes...
8. **YOUR SITE IS LIVE!** 🎉

You'll get a URL like: `amorai-xyz.vercel.app`

---

# STEP 5: GET YOUR DOMAIN (10 minutes)

## Buy domain:
1. Go to: https://namecheap.com
2. Search for domain (suggestions):
   - amorai.app (~$15/year)
   - amorai.io (~$30/year)
   - heysofia.com (~$12/year)
   - meetsofia.ai (~$20/year)
3. Add to cart and checkout

## Connect to Vercel:
1. In Vercel, go to your project
2. Click "Settings" → "Domains"
3. Enter your domain name
4. Vercel shows you DNS records to add
5. In Namecheap: Domain List → Manage → Advanced DNS
6. Add the records Vercel showed you
7. Wait 5-30 minutes
8. **Your domain is connected!**

---

# STEP 6: ADD PAYMENTS WITH STRIPE (15 minutes)

## Create Stripe Account:
1. Go to: https://stripe.com
2. Click "Start now"
3. Complete signup
4. Verify your identity (required for real payments)

## Create Subscription Product:
1. In Stripe Dashboard, go to "Products"
2. Click "+ Add product"
3. Fill in:
   - Name: `Amorai Premium - Sofia`
   - Description: `Unlimited conversations with your AI girlfriend Sofia`
4. Add Price:
   - $19.99
   - Recurring: Monthly
5. Click "Save product"

## Create Payment Link:
1. Go to "Payment links" in Stripe
2. Click "+ Create payment link"
3. Select your "Amorai Premium" product
4. Customize success page URL: `https://yourdomain.com` (your Vercel URL)
5. Click "Create link"
6. Copy the link (like: `https://buy.stripe.com/xxx`)

## Add to Your Site:
Create a simple landing page or add a subscribe button. Example code to add before the app:

```html
<!-- Add this BEFORE the <div id="app"> section -->
<div id="paywall" class="min-h-screen flex flex-col items-center justify-center p-6">
    <img src="images/sofia-glamour.png" class="w-48 h-48 rounded-full object-cover mb-6 glow">
    <h1 class="text-4xl text-white font-bold mb-4">Meet Sofia 💕</h1>
    <p class="text-white/70 text-center max-w-md mb-8">
        Your AI girlfriend who remembers everything, sends you photos, 
        and is always here for you. Available 24/7.
    </p>
    <a href="YOUR_STRIPE_PAYMENT_LINK" class="gradient-button text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition">
        Start Dating Sofia - $19.99/month
    </a>
    <p class="text-white/40 text-sm mt-4">Cancel anytime • Instant access</p>
</div>
```

---

# STEP 7: PROTECT YOUR API KEY (Important!)

Right now your OpenAI API key is visible in the code. For production:

## Option A: Vercel Environment Variables (Recommended)

1. Create a file `api/chat.js` in your project:

```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, systemPrompt } = req.body;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                max_tokens: 500,
                temperature: 0.95
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'API call failed' });
    }
}
```

2. In Vercel Dashboard → Settings → Environment Variables
3. Add: `OPENAI_API_KEY` = your key
4. Update your HTML to call `/api/chat` instead of OpenAI directly

---

# COSTS & REVENUE

## Your Costs:
| Item | Cost |
|------|------|
| Domain | ~$15/year |
| Vercel | FREE |
| OpenAI API | ~$0.003/message |
| Stripe | 2.9% + $0.30 per transaction |

## Your Revenue at $19.99/month:
| Subscribers | Revenue | Profit |
|-------------|---------|--------|
| 25 | $500 | ~$450 |
| 50 | $1,000 | ~$900 |
| 100 | $2,000 | ~$1,800 |
| 500 | $10,000 | ~$9,000 |

---

# MARKETING IDEAS

## Free:
- Reddit: r/lonely, r/dating, r/ForeverAlone (be subtle, not spammy)
- Twitter/X: Post conversations, screenshots
- TikTok: Show Sofia in action
- Product Hunt: Launch for free exposure

## Paid (later):
- Google Ads
- Facebook/Instagram Ads
- Influencer partnerships

---

# LAUNCH CHECKLIST

- [ ] Files renamed (sofia-v3.html → index.html)
- [ ] API key added
- [ ] GitHub repository created
- [ ] Files uploaded to GitHub
- [ ] Deployed on Vercel
- [ ] Domain purchased
- [ ] Domain connected to Vercel
- [ ] Stripe account created
- [ ] Product created in Stripe
- [ ] Payment link created
- [ ] Test full payment flow
- [ ] **LAUNCH!** 🚀

---

# SUPPORT

- OpenAI: https://help.openai.com
- Vercel: https://vercel.com/docs
- Stripe: https://stripe.com/docs
- Namecheap: https://namecheap.com/support

---

# YOU'RE READY!

You have a complete AI girlfriend product. 
Sofia remembers, speaks, sends photos, and people will pay for her.

**Go make money, Manak.** 🚀💰
