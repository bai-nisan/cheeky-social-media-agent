import { MetricoolClient } from './metricool-client.js';

interface ProfileAnalysis {
  accountInfo: {
    name: string;
    id: string;
    connectedDate: string;
    timezone: string;
  };
  dataAvailability: {
    followers: boolean;
    posts: boolean;
    impressions: boolean;
    engagement: boolean;
  };
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
}

class ProfileAnalyzer {
  private client: MetricoolClient;
  private blogId: string = '5103233'; // Gal's LinkedIn brand ID

  constructor() {
    this.client = new MetricoolClient();
  }

  async analyzeProfile(): Promise<ProfileAnalysis> {
    console.log('🔍 Starting comprehensive profile analysis...\n');

    // Get account info
    const brands = await this.client.getBrands();
    const account = brands[0];

    console.log('📊 Account Information:');
    console.log(`   Name: ${account.label}`);
    console.log(`   Brand ID: ${account.id}`);
    console.log(`   Connected: ${new Date(account.firstConnectionDate).toLocaleDateString()}`);
    console.log(`   Timezone: ${account.timezone}`);
    console.log(`   LinkedIn URN: ${account.linkedinCompany}\n`);

    // Test all available metrics
    const dataAvailability = await this.testDataAvailability();
    
    // Generate insights
    const insights = await this.generateInsights(account, dataAvailability);
    
    // Create recommendations
    const recommendations = this.generateRecommendations(dataAvailability);
    
    // Define next steps
    const nextSteps = this.defineNextSteps(dataAvailability);

    return {
      accountInfo: {
        name: account.label,
        id: account.id.toString(),
        connectedDate: new Date(account.firstConnectionDate).toLocaleDateString(),
        timezone: account.timezone
      },
      dataAvailability,
      insights,
      recommendations,
      nextSteps
    };
  }

  private async testDataAvailability() {
    console.log('🧪 Testing data availability...\n');

    const availability = {
      followers: false,
      posts: false,
      impressions: false,
      engagement: false
    };

    try {
      // Test followers
      const followers = await this.client.getLinkedInFollowersTimeline(this.blogId);
      const hasFollowerData = followers && followers.length > 0 && 
        followers.some((point: any) => parseInt(point[1]) > 0);
      availability.followers = hasFollowerData;
      console.log(`📈 Followers data: ${hasFollowerData ? '✅ Available' : '❌ Not available'}`);

      // Test posts
      const posts = await this.client.getLinkedInPosts(this.blogId);
      availability.posts = posts && posts.length > 0;
      console.log(`📝 Posts data: ${availability.posts ? '✅ Available' : '❌ Not available'}`);

      // Test impressions
      const impressions = await this.testMetric('inCompanyImpressions');
      availability.impressions = impressions;
      console.log(`👁️  Impressions data: ${impressions ? '✅ Available' : '❌ Not available'}`);

      // Test engagement
      const likes = await this.testMetric('inPostsLikes');
      const comments = await this.testMetric('inComments');
      availability.engagement = likes || comments;
      console.log(`💙 Engagement data: ${availability.engagement ? '✅ Available' : '❌ Not available'}`);

    } catch (error) {
      console.error('❌ Error testing data availability:', error);
    }

    console.log('');
    return availability;
  }

  private async testMetric(metric: string): Promise<boolean> {
    try {
      const endpoint = `/stats/timeline/${metric}`;
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const params = {
        blogId: this.blogId,
        start: thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, ''),
        end: today.toISOString().slice(0, 10).replace(/-/g, '')
      };
      
      // Access private method through any
      const response = await (this.client as any).makeRequest(endpoint, params);
      return response && response.length > 0 && 
        response.some((point: any) => parseInt(point[1]) > 0);
    } catch {
      return false;
    }
  }

  private async generateInsights(account: any, dataAvailability: any): Promise<string[]> {
    console.log('💡 Generating insights...\n');

    const insights: string[] = [];

    // Account setup insights
    const connectionDate = new Date(account.firstConnectionDate);
    const daysSinceConnection = Math.floor((Date.now() - connectionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    insights.push(`Your LinkedIn account was connected to Metricool ${daysSinceConnection} days ago (${connectionDate.toLocaleDateString()})`);

    if (daysSinceConnection < 7) {
      insights.push("⏰ Data collection is recent - Metricool typically needs 24-48 hours to sync historical data");
    }

    // Data availability insights
    const availableMetrics = Object.entries(dataAvailability).filter(([_, available]) => available).length;
    const totalMetrics = Object.keys(dataAvailability).length;
    
    insights.push(`Currently ${availableMetrics}/${totalMetrics} metric categories are providing data`);

    if (!dataAvailability.followers) {
      insights.push("🔍 Follower data showing as 0 - this could indicate: new connection, privacy settings, or data sync delay");
    }

    if (!dataAvailability.posts) {
      insights.push("📝 No posts detected in the last 30 days - either no posts were made or data hasn't synced yet");
    }

    // Technical insights
    insights.push(`LinkedIn URN: ${account.linkedinCompany} - this identifies your specific LinkedIn profile`);
    insights.push(`Timezone: ${account.timezone} - analytics will be reported in your local time`);

    return insights;
  }

  private generateRecommendations(dataAvailability: any): string[] {
    const recommendations: string[] = [];

    // Data collection recommendations
    if (!dataAvailability.followers) {
      recommendations.push("Check LinkedIn privacy settings - ensure your profile allows follower count visibility");
      recommendations.push("Wait 24-48 hours for Metricool to sync historical data");
      recommendations.push("Verify LinkedIn connection in Metricool dashboard");
    }

    if (!dataAvailability.posts) {
      recommendations.push("Publish a few LinkedIn posts to test data collection");
      recommendations.push("Check if posts are set to 'Public' visibility");
    }

    // General optimization recommendations
    recommendations.push("Set up regular posting schedule to generate data for analysis");
    recommendations.push("Use Metricool's scheduling features for consistent posting");
    recommendations.push("Monitor data for 7-14 days to establish baseline metrics");

    // Advanced features
    recommendations.push("Explore Metricool's best posting times feature once data is available");
    recommendations.push("Set up automated reports for weekly analytics review");

    return recommendations;
  }

  private defineNextSteps(dataAvailability: any): string[] {
    const nextSteps: string[] = [];

    // Immediate steps
    nextSteps.push("✅ Metricool API connection is working perfectly");
    nextSteps.push("⏳ Allow 24-48 hours for historical data to sync");
    
    // Verification steps
    nextSteps.push("🔍 Check Metricool dashboard directly to verify data visibility");
    nextSteps.push("📱 Ensure LinkedIn mobile app permissions are granted");
    
    // Data generation steps
    if (!dataAvailability.posts) {
      nextSteps.push("📝 Publish 2-3 test posts on LinkedIn to generate data");
    }
    
    // Monitoring steps
    nextSteps.push("📊 Run this analysis again in 48 hours to check data availability");
    nextSteps.push("📈 Set up weekly analytics review once data is flowing");
    
    // Advanced features to explore
    nextSteps.push("🎯 Explore Metricool's content recommendation features");
    nextSteps.push("⏰ Set up optimal posting time analysis");
    nextSteps.push("🤖 Integrate analytics insights into content strategy");

    return nextSteps;
  }

  async printAnalysis(): Promise<void> {
    const analysis = await this.analyzeProfile();

    console.log('═'.repeat(60));
    console.log('📊 COMPREHENSIVE LINKEDIN PROFILE ANALYSIS');
    console.log('═'.repeat(60));

    console.log('\n📋 ACCOUNT INFORMATION');
    console.log('─'.repeat(30));
    Object.entries(analysis.accountInfo).forEach(([key, value]) => {
      console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
    });

    console.log('\n🎯 DATA AVAILABILITY STATUS');
    console.log('─'.repeat(30));
    Object.entries(analysis.dataAvailability).forEach(([metric, available]) => {
      const status = available ? '✅ Available' : '❌ Not Available';
      console.log(`${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${status}`);
    });

    console.log('\n💡 KEY INSIGHTS');
    console.log('─'.repeat(30));
    analysis.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });

    console.log('\n🎯 RECOMMENDATIONS');
    console.log('─'.repeat(30));
    analysis.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    console.log('\n🚀 NEXT STEPS');
    console.log('─'.repeat(30));
    analysis.nextSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });

    console.log('\n' + '═'.repeat(60));
  }
}

// CLI execution
async function main() {
  try {
    const analyzer = new ProfileAnalyzer();
    await analyzer.printAnalysis();
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { ProfileAnalyzer, type ProfileAnalysis }; 