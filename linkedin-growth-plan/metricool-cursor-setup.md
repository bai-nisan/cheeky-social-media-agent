# Metricool Setup for Cursor Environment

## 🎯 **What You'll Get**
Use Metricool analytics directly in Cursor with custom TypeScript scripts - no Claude Desktop needed!

---

## 📋 **Step 1: Set Your Credentials**

### **Using Existing .env File** (Recommended)
Add these credentials to your existing `.env` file in the project root:

```bash
# Add these lines to your existing .env file
METRICOOL_USER_TOKEN=your-token-from-screenshot
METRICOOL_USER_ID=your-user-id-here
```

### **Find Your User ID**
You still need your User ID from Metricool:
1. **Go to Metricool dashboard**
2. **Click your profile/account name** (top right)
3. **Look for "User ID" or "Account ID"** 
4. **It's usually a number** like `12345`

If you can't find it, contact Metricool support and ask for your "User ID for API access".

---

## 📋 **Step 2: Test the Connection**

### **Get Your LinkedIn Accounts**
```bash
cd linkedin-growth-plan
yarn metricool:brands
```

**Expected Output:**
```json
{
  "data": [
    {
      "id": 12345,
      "name": "Your LinkedIn Profile",
      "social_network": "linkedin",
      "url": "https://linkedin.com/in/yourprofile"
    }
  ]
}
```

---

## 📋 **Step 3: Analyze Your LinkedIn Performance**

### **Get Analytics for Your Account**
First, note your `blog_id` from the brands response above, then:

```bash
yarn metricool:analyze YOUR_BLOG_ID
```

**Example:**
```bash
yarn metricool:analyze 12345
```

**Expected Output:**
```
📈 Analyzing LinkedIn performance for blog 12345...

📊 LinkedIn Analytics Summary:
   Total Posts: 25
   Total Impressions: 15,432
   Average Engagement Rate: 4.2%

🏆 Top Performing Posts:
   1. 8.5% - "השבוע גיליתי משהו שישנה לכם את הדרך לפתח עם AI..."
   2. 6.2% - "בדקתי 5 כלי AI לפיתוח השבוע. התוצאות היו מפתיעות..."
   3. 5.8% - "הטעות הכי גדולה שעושים כשמתחילים לפתח עם AI..."

✅ Analytics data saved to linkedin-growth-plan/cache/linkedin-analytics.json
```

---

## 📋 **Step 4: Get Content Recommendations**

### **Based on Your Performance Data**
```bash
yarn metricool:recommendations YOUR_BLOG_ID
```

**Expected Output:**
```
💡 Generating content recommendations for blog 12345...

📝 Content Recommendations:
   1. Your best performing post had 8.5% engagement. Similar content: "השבוע גיליתי משהו שישנה לכם את הדרך לפתח עם AI. עבדתי על פרויקט שדרש אינטגרציה מורכבת..."
   2. Your average engagement rate is 4.2%. Posts above this threshold tend to perform well.
   3. Best posting time: Monday at 9:00 (6.3% avg engagement)
```

---

## 🛠 **Available Commands**

### **All Metricool Commands in Cursor**
```bash
# Get connected LinkedIn accounts and their blog IDs
yarn metricool:brands

# Analyze performance for a specific account
yarn metricool:analyze <blog_id>

# Get content recommendations based on your data
yarn metricool:recommendations <blog_id>
```

---

## 📊 **Weekly Routine Using Cursor**

### **Sunday: Analytics Review** (10 minutes)
```bash
# Get latest analytics
yarn metricool:analyze YOUR_BLOG_ID

# Get content recommendations
yarn metricool:recommendations YOUR_BLOG_ID
```

### **Use the Output to:**
- See which posts performed best last week
- Identify optimal posting times for YOUR audience
- Get content suggestions based on YOUR data
- Plan next week's content using proven patterns

---

## 🔍 **Data Storage**

### **Local Analytics Cache**
Your data is saved locally at:
```
linkedin-growth-plan/cache/linkedin-analytics.json
```

This includes:
- Historical performance data
- Top performing posts
- Engagement patterns
- Optimal posting times

### **Use This Data For:**
- Content planning
- Performance tracking
- Strategy optimization
- Weekly routine insights

---

## 🚨 **Troubleshooting**

### **"Metricool credentials not found"**
- Make sure the credentials are added to your existing `.env` file in the project root
- Check that `METRICOOL_USER_TOKEN` and `METRICOOL_USER_ID` are set correctly
- Verify your token is copied exactly from Metricool (no extra spaces)

### **"HTTP 401: Unauthorized"**
- Double-check your API token from Metricool
- Confirm you have Advanced plan (required for API access)
- Try regenerating your API token in Metricool

### **"HTTP 404: Not Found"**
- Verify your blog ID is correct (get it from `yarn metricool:brands`)
- Make sure your LinkedIn account is connected to Metricool

### **"No posts found"**
- Check that you have recent LinkedIn posts
- Verify your LinkedIn account is properly connected in Metricool
- Try expanding the date range or posting more content

---

## ✅ **Verification Checklist**

- [ ] **Metricool account** with Advanced plan
- [ ] **LinkedIn connected** to Metricool  
- [ ] **API token** copied from Metricool dashboard
- [ ] **User ID** found and noted
- [ ] **Environment variables** added to existing `.env` file in project root
- [ ] **Brands command** returns your LinkedIn account
- [ ] **Analytics command** shows your post performance
- [ ] **Recommendations** based on your actual data

---

## 🎯 **Next Steps**

Once everything is working:

1. **Note your blog ID** from the brands command
2. **Set up weekly routine** - run analytics every Sunday
3. **Use recommendations** to create better content
4. **Track improvements** with monthly analytics reviews
5. **Optimize posting times** based on your data

---

**Your LinkedIn growth is now data-driven within Cursor! No more guessing what works - you have the actual performance metrics.** 🚀 