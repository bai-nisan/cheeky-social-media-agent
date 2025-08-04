import fetch from 'node-fetch';

interface AyrshareConfig {
  apiKey: string;
  baseUrl?: string;
}

interface AyrsharePost {
  post: string;
  platforms: string[];
  scheduleDate?: string;
  mediaUrls?: string[];
  profileKeys?: string[];
}

interface AyrshareResponse {
  status: string;
  id?: string;
  postIds?: Array<{
    id: string;
    platform: string;
    posted: boolean;
    postUrl?: string;
  }>;
  errors?: any[];
}

interface ScheduledPost {
  id: string;
  post: string;
  platforms: string[];
  scheduleDate: string;
  status: string;
  postIds?: Array<{
    id: string;
    platform: string;
    posted: boolean;
  }>;
}

export class AyrshareScheduler {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AyrshareConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://app.ayrshare.com/api';
  }

  /**
   * Schedule a single post
   */
  async schedulePost(
    content: string, 
    scheduleDate?: string,
    options: {
      platforms?: string[];
      mediaUrls?: string[];
      profileKeys?: string[];
    } = {}
  ): Promise<AyrshareResponse> {
    const postData: AyrsharePost = {
      post: content,
      platforms: options.platforms || ['twitter'],
      ...(scheduleDate && { scheduleDate }),
      ...(options.mediaUrls && { mediaUrls: options.mediaUrls }),
      ...(options.profileKeys && { profileKeys: options.profileKeys })
    };

    const response = await fetch(`${this.baseUrl}/post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to schedule post: ${response.status} ${error}`);
    }

    return await response.json() as AyrshareResponse;
  }

  /**
   * Schedule a Twitter thread (Ayrshare automatically handles threading for long content)
   */
  async scheduleThread(
    posts: string[], 
    scheduleDate?: string,
    intervalMinutes: number = 1,
    options: {
      platforms?: string[];
      profileKeys?: string[];
    } = {}
  ): Promise<AyrshareResponse[]> {
    const results: AyrshareResponse[] = [];
    
    for (let i = 0; i < posts.length; i++) {
      let postTime = scheduleDate;
      
      // If we have a schedule date, add interval for subsequent posts
      if (scheduleDate && i > 0) {
        const baseTime = new Date(scheduleDate);
        baseTime.setMinutes(baseTime.getMinutes() + (i * intervalMinutes));
        postTime = baseTime.toISOString();
      }

      // Add thread numbering for clarity
      const threadContent = posts.length > 1 ? `${i + 1}/${posts.length} ${posts[i]}` : posts[i];
      
      const result = await this.schedulePost(threadContent, postTime, {
        platforms: options.platforms || ['twitter'],
        profileKeys: options.profileKeys
      });
      
      results.push(result);
      
      // Small delay between scheduling calls to avoid rate limits
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Get analytics for a specific post
   */
  async getPostAnalytics(postId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: postId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get analytics: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Get user's social media profiles
   */
  async getProfiles(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/profiles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get profiles: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(): Promise<ScheduledPost[]> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'twitter',
        action: 'scheduled'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get scheduled posts: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.posts || [];
  }

  /**
   * Delete a scheduled post
   */
  async deleteScheduledPost(postId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: postId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete scheduled post: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Upload media for use in posts
   */
  async uploadMedia(mediaUrl: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: mediaUrl
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload media: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Get account usage and limits
   */
  async getUsage(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get usage: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Validate API key and connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.getUsage();
      return true;
    } catch (error) {
      console.error('Ayrshare connection validation failed:', error);
      return false;
    }
  }
}

// Utility functions for time parsing
export function parseRelativeTime(timeString: string): Date {
  const now = new Date();
  const lowerTime = timeString.toLowerCase();

  // Handle "in X minutes/hours/days"
  const inMatch = lowerTime.match(/in (\d+) (minute|hour|day)s?/);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2];
    
    switch (unit) {
      case 'minute':
        now.setMinutes(now.getMinutes() + amount);
        break;
      case 'hour':
        now.setHours(now.getHours() + amount);
        break;
      case 'day':
        now.setDate(now.getDate() + amount);
        break;
    }
    return now;
  }

  // Handle "tomorrow at X"
  const tomorrowMatch = lowerTime.match(/tomorrow (?:at )?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (tomorrowMatch) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let hours = parseInt(tomorrowMatch[1]);
    const minutes = parseInt(tomorrowMatch[2] || '0');
    const ampm = tomorrowMatch[3];
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  }

  // Handle "today at X"
  const todayMatch = lowerTime.match(/today (?:at )?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (todayMatch) {
    const today = new Date(now);
    
    let hours = parseInt(todayMatch[1]);
    const minutes = parseInt(todayMatch[2] || '0');
    const ampm = todayMatch[3];
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    today.setHours(hours, minutes, 0, 0);
    return today;
  }

  // If no match, try to parse as ISO date
  try {
    return new Date(timeString);
  } catch {
    throw new Error(`Unable to parse time: ${timeString}`);
  }
} 