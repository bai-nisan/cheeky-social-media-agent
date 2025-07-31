# Metricool Setup Guide - From Zero to LinkedIn Analytics

## 🎯 **What You'll Achieve**
By the end of this setup, you'll have real LinkedIn analytics data accessible through Claude, enabling data-driven content optimization instead of guesswork.

---

## 📋 **Step 1: Create Metricool Account**

### **Go to Metricool Website**
1. Visit **https://metricool.com**
2. Click **"Start for free"** or **"Sign up"**
3. Create account with your email

### **Important: Plan Selection**
```
⚠️  CRITICAL: You need "Advanced" plan for API access

Free Plan: ❌ No API access
Starter Plan ($12/month): ❌ No API access  
Advanced Plan ($19/month): ✅ API access included
Professional Plan ($49/month): ✅ API access included
```

**Recommendation**: Start with **Advanced Plan ($19/month)** - you can cancel anytime if it doesn't work for you.

### **Sign Up Process**
1. **Email + Password** - Create your account
2. **Plan Selection** - Choose "Advanced" (required for API)
3. **Payment** - Add payment method for Advanced plan
4. **Verification** - Check email and verify account

---

## 📋 **Step 2: Connect Your LinkedIn Account**

### **LinkedIn Connection Process**
1. **Log into Metricool** - Go to your new dashboard
2. **Add Social Network** - Look for "Connect accounts" or "+" button
3. **Select LinkedIn** - Choose LinkedIn from social media options
4. **Authorize Connection** - You'll be redirected to LinkedIn
5. **Grant Permissions** - Allow Metricool to access your LinkedIn data

### **Required LinkedIn Permissions**
Metricool will ask for:
- ✅ **Read your profile info**
- ✅ **Access to your posts and their performance**
- ✅ **Ability to schedule posts** (optional but recommended)

### **Verification**
After connecting, you should see:
- Your LinkedIn profile connected in Metricool dashboard
- Basic profile stats appearing
- Historical posts being imported (may take a few minutes)

---

## 📋 **Step 3: Get Your API Credentials**

### **Find Your API Information**
1. **Go to Metricool Dashboard**
2. **Look for "API" or "Developer" section** (usually in settings/account area)
3. **Generate API credentials**

### **What You Need to Find**
```
METRICOOL_USER_TOKEN: "your-long-token-here"
METRICOOL_USER_ID: "your-user-id-number"
```

### **Where to Look**
- **Settings** → **API Access**
- **Account** → **API Information**  
- **Developer** → **API Keys**
- Or contact Metricool support if you can't find it

### **Save These Safely**
- Copy both values to a secure note
- You'll need them for Claude Desktop configuration

---

## 📋 **Step 4: Configure Claude Desktop**

### **Find Your Claude Desktop Config File**

**On Mac:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**On Windows:**
```bash
%APPDATA%/Claude/claude_desktop_config.json
```

### **Edit the Configuration File**

If the file doesn't exist, create it. Add this configuration:

```json
{
    "mcpServers": {
        "mcp-metricool": {
            "command": "uvx",
            "args": [
                "--upgrade", 
                "mcp-metricool"
            ],
            "env": {
                "METRICOOL_USER_TOKEN": "YOUR-ACTUAL-TOKEN-HERE",
                "METRICOOL_USER_ID": "YOUR-ACTUAL-USER-ID-HERE"
            }
        }
    }
}
```

### **Replace the Placeholders**
- Replace `YOUR-ACTUAL-TOKEN-HERE` with your real Metricool token
- Replace `YOUR-ACTUAL-USER-ID-HERE` with your real Metricool user ID
- Keep the quotes around the values

---

## 📋 **Step 5: Test the Integration**

### **Restart Claude Desktop**
1. **Close Claude Desktop completely**
2. **Reopen Claude Desktop**
3. **Wait for it to fully load**

### **Test the Connection**
Ask Claude:
```
"Use Metricool to get my LinkedIn brands and basic information"
```

### **Expected Response**
Claude should:
- ✅ Connect to Metricool successfully
- ✅ Show your LinkedIn account information
- ✅ Display basic stats about your profile

### **If It Doesn't Work**
Common issues:
- **Wrong API credentials** - Double-check token and user ID
- **JSON formatting error** - Verify commas, quotes, brackets
- **Plan limitations** - Confirm you have Advanced plan
- **Claude Desktop not restarted** - Close and reopen completely

---

## 📋 **Step 6: Get Your First Analytics**

### **Test Basic Analytics**
Ask Claude:
```
"Use Metricool to analyze my LinkedIn posts from the last 30 days. 
Show me my top 3 performing posts and their engagement metrics."
```

### **What You Should See**
- List of your recent LinkedIn posts
- Engagement metrics (likes, comments, shares)
- Performance data and insights
- Posting patterns and trends

### **If You Have Limited Data**
- **New LinkedIn account?** - May have limited historical data
- **Private profile?** - Some metrics might be restricted
- **Recent posts only?** - Start posting more to get better data

---

## 📋 **Step 7: Test Content Optimization**

### **Get Posting Time Recommendations**
Ask Claude:
```
"Use Metricool to find my optimal LinkedIn posting times. 
When does my content get the best engagement?"
```

### **Get Content Suggestions**
Ask Claude:
```
"Based on my Metricool LinkedIn data, what topics and content types 
perform best for my audience? Suggest content ideas for this week."
```

---

## 🎯 **Verification Checklist**

Before considering setup complete, verify:

- [ ] **Metricool Account**: Advanced plan active and working
- [ ] **LinkedIn Connected**: Profile shows in Metricool dashboard  
- [ ] **API Credentials**: Token and User ID obtained and saved
- [ ] **Claude Desktop**: Config file updated with correct credentials
- [ ] **MCP Connection**: Claude can access Metricool data
- [ ] **Basic Analytics**: Can retrieve LinkedIn post performance
- [ ] **Optimization Ready**: Can get posting time recommendations

---

## 🚨 **Troubleshooting**

### **"Can't find API credentials"**
- Contact Metricool support directly
- Ask specifically for "API access for MCP integration"
- Confirm you have Advanced plan activated

### **"Claude can't connect to Metricool"**
- Verify JSON syntax in config file (use JSONLint.com)
- Check that credentials are exactly as provided by Metricool
- Restart Claude Desktop completely
- Try creating a new Claude conversation

### **"Limited data available"**
- Post more content to LinkedIn to build data history
- Wait 24-48 hours for Metricool to collect more analytics
- Verify LinkedIn profile is public/business account

### **"Advanced plan required"**
- Free/Starter plans don't include API access
- Upgrade to Advanced ($19/month) minimum
- Contact Metricool for enterprise options if needed

---

## ✅ **Success Indicators**

You'll know setup is working when:
1. **Claude responds** with actual Metricool data
2. **LinkedIn metrics** show real numbers from your account
3. **Content suggestions** are based on your actual performance
4. **Posting times** reflect your audience's behavior patterns

---

## 🎯 **Next Steps After Setup**

Once everything is working:

1. **Start Weekly Habits** - Use the `weekly-habits.md` routine
2. **Analyze Historical Data** - Get insights from past posts  
3. **Optimize Content Strategy** - Use data to improve performance
4. **Track Improvements** - Monitor engagement trends over time

---

## 💰 **Cost Breakdown**

**Metricool Advanced Plan**: $19/month
- ✅ LinkedIn analytics API access
- ✅ Post scheduling and management  
- ✅ Performance optimization insights
- ✅ Historical data analysis

**ROI Calculation**: If this improves your LinkedIn engagement by even 20%, the increased visibility and professional opportunities will easily justify the cost.

---

## 📞 **Getting Help**

### **Metricool Support**
- Email: support@metricool.com
- Live chat: Available in dashboard
- Documentation: help.metricool.com

### **Claude/MCP Issues**
- Anthropic documentation: docs.anthropic.com
- MCP specification: github.com/modelcontextprotocol

### **This Project Issues**
- Check other files in this directory for specific guidance
- Review `weekly-habits.md` for usage patterns
- Reference `content-templates.md` for content optimization

---

**Ready to get started? Begin with Step 1 and work through each step systematically. Once setup is complete, you'll have data-driven LinkedIn optimization!** 🚀 