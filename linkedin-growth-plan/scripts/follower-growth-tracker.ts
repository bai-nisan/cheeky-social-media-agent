import { MetricoolClient } from './metricool-client.js';

interface FollowerGrowthData {
  period: string;
  startDate: string;
  endDate: string;
  startFollowers: number;
  endFollowers: number;
  netGrowth: number;
  gainedFollowers: number;
  lostFollowers: number;
  growthPercentage: number;
}

class FollowerGrowthTracker {
  private client: MetricoolClient;
  private blogId: string = '5103233'; // Gal's LinkedIn brand ID

  constructor() {
    this.client = new MetricoolClient();
  }

  /**
   * Helper method to get follower data using the client's test method approach
   */
  private async getFollowerData(metric: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      // Create a proxy method to access the private makeRequest
      const clientWithRequest = this.client as any;
      const endpoint = `/stats/timeline/${metric}`;
      
      // Convert YYYY-MM-DD format to YYYYMMDD for Metricool API
      const formatForApi = (dateStr: string) => dateStr.replace(/-/g, '');
      
      const response = await clientWithRequest.makeRequest(endpoint, {
        blogId: this.blogId,
        start: formatForApi(startDate),
        end: formatForApi(endDate)
      });
      
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.log(`⚠️ Could not get ${metric} data:`, error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Get follower growth for specific time periods
   */
  async trackGrowthPeriods(): Promise<void> {
    console.log('📈 LINKEDIN FOLLOWER GROWTH TRACKER\n');
    console.log('🎯 Checking your follower growth over different time periods...\n');
    console.log('═'.repeat(70));

    const now = new Date();
    
    // Define time periods to check
    const periods = [
      { name: '24 Hours', hours: 24 },
      { name: '48 Hours', hours: 48 },
      { name: '72 Hours', hours: 72 },
      { name: '1 Week', hours: 168 },
      { name: '2 Weeks', hours: 336 }
    ];

    const growthData: FollowerGrowthData[] = [];

    for (const period of periods) {
      console.log(`\n🔍 Analyzing ${period.name} growth...`);
      
      const endDate = new Date(now);
      const startDate = new Date(now.getTime() - (period.hours * 60 * 60 * 1000));
      
      const growth = await this.getFollowerGrowthForPeriod(
        startDate, 
        endDate, 
        period.name
      );
      
      if (growth) {
        growthData.push(growth);
        this.displayGrowthData(growth);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 GROWTH SUMMARY');
    console.log('═'.repeat(70));
    
    if (growthData.length > 0) {
      this.displayGrowthSummary(growthData);
    } else {
      console.log('❌ No growth data available yet');
      console.log('💡 This might be because:');
      console.log('   • Your account was recently connected to Metricool');
      console.log('   • Data collection is still in progress');
      console.log('   • Try again in 24-48 hours');
    }
  }

  /**
   * Get follower growth data for a specific period
   */
  private async getFollowerGrowthForPeriod(
    startDate: Date, 
    endDate: Date, 
    periodName: string
  ): Promise<FollowerGrowthData | null> {
    try {
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

             // Use the public methods available in MetricoolClient
       const [totalFollowers, inFollowers, outFollowers, netFollowers] = await Promise.all([
         this.getFollowerData('followers', startDateStr, endDateStr),
         this.getFollowerData('inFollowers', startDateStr, endDateStr),
         this.getFollowerData('outFollowers', startDateStr, endDateStr),
         this.getFollowerData('netFollowers', startDateStr, endDateStr)
       ]);

      // Process the data
      const processData = (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) return null;
        
        // Get first and last data points
        const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstPoint = sortedData[0];
        const lastPoint = sortedData[sortedData.length - 1];
        
        return {
          start: parseInt(firstPoint.value) || 0,
          end: parseInt(lastPoint.value) || 0,
          total: data.reduce((sum, point) => sum + (parseInt(point.value) || 0), 0)
        };
      };

      const totalData = processData(totalFollowers);
      const inData = processData(inFollowers);
      const outData = processData(outFollowers);
      const netData = processData(netFollowers);

      // Use the most reliable data source
      let startFollowers = 0;
      let endFollowers = 0;
      let gainedFollowers = 0;
      let lostFollowers = 0;

      if (totalData) {
        startFollowers = totalData.start;
        endFollowers = totalData.end;
      }

      if (inData) {
        gainedFollowers = inData.total;
      }

      if (outData) {
        lostFollowers = outData.total;
      }

      const netGrowth = endFollowers - startFollowers;
      const growthPercentage = startFollowers > 0 ? (netGrowth / startFollowers) * 100 : 0;

      return {
        period: periodName,
        startDate: startDateStr,
        endDate: endDateStr,
        startFollowers,
        endFollowers,
        netGrowth,
        gainedFollowers,
        lostFollowers,
        growthPercentage
      };

         } catch (error) {
       console.log(`❌ Error getting data for ${periodName}:`, error instanceof Error ? error.message : String(error));
       return null;
     }
  }

  /**
   * Display growth data for a specific period
   */
  private displayGrowthData(growth: FollowerGrowthData): void {
    console.log(`\n📊 ${growth.period} Growth Report:`);
    console.log(`   📅 Period: ${growth.startDate} → ${growth.endDate}`);
    console.log(`   👥 Followers: ${growth.startFollowers} → ${growth.endFollowers}`);
    
    if (growth.netGrowth > 0) {
      console.log(`   ✅ Net Growth: +${growth.netGrowth} followers (+${growth.growthPercentage.toFixed(2)}%)`);
    } else if (growth.netGrowth < 0) {
      console.log(`   ⬇️ Net Change: ${growth.netGrowth} followers (${growth.growthPercentage.toFixed(2)}%)`);
    } else {
      console.log(`   ➡️ Net Change: 0 followers (no change)`);
    }
    
    if (growth.gainedFollowers > 0) {
      console.log(`   ⬆️ Gained: +${growth.gainedFollowers} followers`);
    }
    
    if (growth.lostFollowers > 0) {
      console.log(`   ⬇️ Lost: -${growth.lostFollowers} followers`);
    }
  }

  /**
   * Display overall growth summary
   */
  private displayGrowthSummary(growthData: FollowerGrowthData[]): void {
    const validData = growthData.filter(g => g.endFollowers > 0 || g.netGrowth !== 0);
    
    if (validData.length === 0) {
      console.log('⚠️ No significant growth data detected');
      return;
    }

    // Find best and worst periods
    const bestGrowth = validData.reduce((best, current) => 
      current.netGrowth > best.netGrowth ? current : best
    );
    
    const worstGrowth = validData.reduce((worst, current) => 
      current.netGrowth < worst.netGrowth ? current : worst
    );

    console.log(`\n🏆 Best Growth Period: ${bestGrowth.period}`);
    console.log(`   +${bestGrowth.netGrowth} followers (+${bestGrowth.growthPercentage.toFixed(2)}%)`);
    
    if (worstGrowth.netGrowth < 0) {
      console.log(`\n📉 Challenging Period: ${worstGrowth.period}`);
      console.log(`   ${worstGrowth.netGrowth} followers (${worstGrowth.growthPercentage.toFixed(2)}%)`);
    }

    // Current follower count (from most recent data)
    const latestData = validData.find(g => g.endFollowers > 0);
    if (latestData) {
      console.log(`\n👥 Current Followers: ${latestData.endFollowers}`);
    }
  }

  /**
   * Quick check for just the last 24 hours
   */
  async quickCheck24Hours(): Promise<void> {
    console.log('⚡ QUICK 24-HOUR FOLLOWER CHECK\n');
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const growth = await this.getFollowerGrowthForPeriod(yesterday, now, '24 Hours');
    
    if (growth) {
      console.log('📈 Last 24 Hours:');
      console.log(`   👥 ${growth.startFollowers} → ${growth.endFollowers} followers`);
      
      if (growth.netGrowth > 0) {
        console.log(`   🎉 You gained ${growth.netGrowth} followers! (+${growth.growthPercentage.toFixed(2)}%)`);
      } else if (growth.netGrowth < 0) {
        console.log(`   📉 Lost ${Math.abs(growth.netGrowth)} followers (${growth.growthPercentage.toFixed(2)}%)`);
      } else {
        console.log(`   ➡️ No net change in followers`);
      }
    } else {
      console.log('❌ No data available for the last 24 hours');
      console.log('💡 Try again later - data might still be syncing');
    }
  }
}

// CLI execution
async function main() {
  const tracker = new FollowerGrowthTracker();
  
  const command = process.argv[2];
  
  if (command === 'quick') {
    await tracker.quickCheck24Hours();
  } else {
    await tracker.trackGrowthPeriods();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { FollowerGrowthTracker }; 