import dotenv from 'dotenv';
dotenv.config();

interface BufferProfile {
  id: string;
  service: string;
  service_username: string;
  formatted_username: string;
}

interface ScheduledPost {
  id: string;
  text: string;
  due_at: number;
  due_time: string;
  status: 'buffer' | 'sent';
  profile_id: string;
}

interface BufferResponse {
  success: boolean;
  updates?: ScheduledPost[];
  message?: string;
}

export class BufferScheduler {
  private accessToken: string;
  private baseUrl = 'https://api.bufferapp.com/1';

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.BUFFER_ACCESS_TOKEN || '';
    
    if (!this.accessToken) {
      throw new Error('Buffer access token is required. Set BUFFER_ACCESS_TOKEN in your .env file or pass it to the constructor.');
    }
  }

  /**
   * Get all connected social media profiles
   */
  async getProfiles(): Promise<BufferProfile[]> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles.json?access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status} ${response.statusText}`);
      }
      
      const profiles = await response.json();
      return profiles;
    } catch (error) {
      console.error('❌ Error fetching profiles:', error);
      throw error;
    }
  }

  /**
   * Get Twitter profile ID (needed for scheduling posts)
   */
  async getTwitterProfileId(): Promise<string> {
    const profiles = await this.getProfiles();
    const twitterProfile = profiles.find(profile => profile.service === 'twitter');
    
    if (!twitterProfile) {
      throw new Error('No Twitter profile found. Please connect your Twitter account to Buffer first.');
    }
    
    console.log(`✅ Found Twitter profile: ${twitterProfile.formatted_username}`);
    return twitterProfile.id;
  }

  /**
   * Schedule a single tweet
   */
  async schedulePost(
    content: string, 
    scheduledTime: Date, 
    profileId?: string
  ): Promise<ScheduledPost> {
    try {
      // Get Twitter profile ID if not provided
      const twitterProfileId = profileId || await this.getTwitterProfileId();
      
      // Validate content length
      if (content.length > 280) {
        throw new Error(`Tweet is too long: ${content.length}/280 characters`);
      }

      const body = new URLSearchParams({
        'text': content,
        'profile_ids[]': twitterProfileId,
        'scheduled_at': scheduledTime.toISOString()
      });

      const response = await fetch(`${this.baseUrl}/updates/create.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Buffer API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.updates && result.updates.length > 0) {
        const scheduledPost = result.updates[0];
        console.log(`✅ Post scheduled for ${scheduledTime.toLocaleString()}`);
        console.log(`📝 Content: "${content}"`);
        console.log(`🆔 Post ID: ${scheduledPost.id}`);
        return scheduledPost;
      } else {
        throw new Error(`Failed to schedule post: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error('❌ Error scheduling post:', error);
      throw error;
    }
  }

  /**
   * Schedule a Twitter thread (multiple tweets posted in sequence)
   */
  async scheduleThread(
    posts: string[], 
    startTime: Date, 
    intervalMinutes: number = 1,
    profileId?: string
  ): Promise<ScheduledPost[]> {
    console.log(`🧵 Scheduling thread of ${posts.length} tweets...`);
    
    const results: ScheduledPost[] = [];
    const twitterProfileId = profileId || await this.getTwitterProfileId();

    for (let i = 0; i < posts.length; i++) {
      const postTime = new Date(startTime.getTime() + (i * intervalMinutes * 60000));
      
      try {
        const result = await this.schedulePost(posts[i], postTime, twitterProfileId);
        results.push(result);
        console.log(`✅ Thread ${i + 1}/${posts.length} scheduled for ${postTime.toLocaleString()}`);
        
        // Small delay to avoid rate limiting
        if (i < posts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Failed to schedule thread post ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(`🎉 Successfully scheduled ${results.length} thread posts!`);
    return results;
  }

  /**
   * Get all pending (scheduled) posts
   */
  async getPendingPosts(profileId?: string): Promise<ScheduledPost[]> {
    try {
      const twitterProfileId = profileId || await this.getTwitterProfileId();
      
      const response = await fetch(
        `${this.baseUrl}/profiles/${twitterProfileId}/updates/pending.json?access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.updates || [];
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      throw error;
    }
  }

  /**
   * Delete a scheduled post
   */
  async deleteScheduledPost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/updates/${postId}/destroy.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully deleted post ${postId}`);
        return true;
      } else {
        console.error(`❌ Failed to delete post: ${JSON.stringify(result)}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Schedule a post for immediate posting
   */
  async postNow(content: string, profileId?: string): Promise<ScheduledPost> {
    try {
      const twitterProfileId = profileId || await this.getTwitterProfileId();
      
      if (content.length > 280) {
        throw new Error(`Tweet is too long: ${content.length}/280 characters`);
      }

      const body = new URLSearchParams({
        'text': content,
        'profile_ids[]': twitterProfileId,
        'now': 'true'
      });

      const response = await fetch(`${this.baseUrl}/updates/create.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Buffer API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.updates && result.updates.length > 0) {
        const post = result.updates[0];
        console.log(`🚀 Post sent immediately!`);
        console.log(`📝 Content: "${content}"`);
        return post;
      } else {
        throw new Error(`Failed to post immediately: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error('❌ Error posting immediately:', error);
      throw error;
    }
  }

  /**
   * Helper method to parse relative time strings
   */
  parseRelativeTime(timeString: string): Date {
    const now = new Date();
    const lowerTime = timeString.toLowerCase();

    if (lowerTime.includes('minute')) {
      const minutes = parseInt(lowerTime.match(/\d+/)?.[0] || '5');
      return new Date(now.getTime() + minutes * 60000);
    }
    
    if (lowerTime.includes('hour')) {
      const hours = parseInt(lowerTime.match(/\d+/)?.[0] || '1');
      return new Date(now.getTime() + hours * 3600000);
    }
    
    if (lowerTime.includes('day')) {
      const days = parseInt(lowerTime.match(/\d+/)?.[0] || '1');
      return new Date(now.getTime() + days * 86400000);
    }

    // Default to ISO string parsing
    return new Date(timeString);
  }
}

// Export for use in other files
export default BufferScheduler; 