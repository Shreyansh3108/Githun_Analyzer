import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, GitFork, Star, Code, AlertCircle, Loader2, Github, User, BookOpen, Users, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type definitions
interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
}

interface UserProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface CommitActivity {
  date: string;
  count: number;
}

// CORS proxy URL
const CORS_PROXY = 'https://corsproxy.io/?';

// Custom theme colors
const THEME = {
  primary: '#8A2BE2', // Violet
  secondary: '#9D4EDD', // Lighter violet
  tertiary: '#C77DFF', // Even lighter violet
  accent: '#E0AAFF', // Very light violet
  background: '#ffffff', // White
  textDark: '#2D3748', // Dark gray
  textLight: '#A0AEC0', // Light gray
};

// Function to generate language badge color
const getLanguageColor = (language: string | null): string => {
  if (!language) return THEME.textLight;
  
  const languageColors: Record<string, string> = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'C++': '#f34b7d',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
  };
  
  return languageColors[language] || THEME.primary;
};

// Generate mock data for demonstration
const generateMockData = (username: string) => {
  // Use username as seed for pseudo-random generation
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate mock profile
  const profile: UserProfile = {
    login: username,
    avatar_url: `/api/placeholder/200/200?text=${username.charAt(0).toUpperCase()}`,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    bio: Math.random() > 0.3 ? 'Software developer passionate about open source and building great user experiences.' : null,
    public_repos: Math.floor(Math.random() * 30) + 2,
    followers: Math.floor(Math.random() * 1000) + 10,
    following: Math.floor(Math.random() * 200) + 5,
    created_at: new Date(Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)).toISOString()
  };
  
  // Generate mock repositories
  const repos: Repository[] = [];
  const repoCount = Math.min(Math.floor(Math.random() * 8) + 3, profile.public_repos);
  const languages = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Ruby", "C++", "PHP", "HTML", "CSS"];
  
  for (let i = 0; i < repoCount; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365 * 3));
    
    repos.push({
      id: i + 1,
      name: `${username}-project-${i + 1}`,
      description: Math.random() > 0.2 ? `A ${languages[Math.floor(Math.random() * languages.length)]} project with modern architecture and clean design patterns.` : null,
      html_url: `https://github.com/${username}/${username}-project-${i + 1}`,
      stargazers_count: Math.floor(Math.random() * 500),
      forks_count: Math.floor(Math.random() * 200),
      language: Math.random() > 0.1 ? languages[Math.floor(Math.random() * languages.length)] : null,
      created_at: createdDate.toISOString()
    });
  }
  
  // Generate mock commit activity
  const commitActivity: CommitActivity[] = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayValue = date.getDate() + date.getMonth() * 30;
    const randomFactor = Math.sin(seed * dayValue * 0.1) * 0.5 + 0.5;
    const count = Math.floor(randomFactor * 12);
    
    commitActivity.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return { profile, repos, commitActivity };
};

export default function GitHubProfileAnalyzer() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commitActivity, setCommitActivity] = useState<CommitActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);

  const fetchGitHubData = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for demonstration
        const mockData = generateMockData(username);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfile(mockData.profile);
        setRepositories(mockData.repos);
        setCommitActivity(mockData.commitActivity);
      } else {
        // Fetch user profile using CORS proxy
        const profileResponse = await fetch(`${CORS_PROXY}https://api.github.com/users/${username}`);
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            throw new Error(`User '${username}' not found on GitHub`);
          } else if (profileResponse.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          } else {
            throw new Error(`GitHub API error: ${profileResponse.status}`);
          }
        }
        
        const profileData = await profileResponse.json();
        setProfile(profileData);
        
        // Fetch repositories
        const reposResponse = await fetch(`${CORS_PROXY}https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        
        if (!reposResponse.ok) {
          throw new Error(`Failed to fetch repositories: ${reposResponse.status}`);
        }
        
        const reposData = await reposResponse.json();
        setRepositories(reposData);
        
        // Use mock commit activity data
        const mockCommitActivity = generateMockData(username).commitActivity;
        setCommitActivity(mockCommitActivity);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setProfile(null);
      setRepositories([]);
      setCommitActivity([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate account age
  const calculateAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffYears = now.getFullYear() - created.getFullYear();
    const diffMonths = now.getMonth() - created.getMonth();
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background }}>
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <Github size={36} style={{ color: THEME.primary }} />
            <h1 className="text-4xl font-bold ml-3" style={{ color: THEME.primary }}>
              GitHubInsight
            </h1>
          </div>
          <p className="text-lg" style={{ color: THEME.textLight }}>
            Visualize and analyze GitHub profiles with elegance
          </p>
        </div>
        
        <Card className="mb-10 shadow-lg border-0" style={{ borderRadius: '12px' }}>
          <CardHeader style={{ background: `linear-gradient(to right, ${THEME.primary}, ${THEME.tertiary})`, borderRadius: '12px 12px 0 0' }}>
            <CardTitle className="text-white text-xl">Search GitHub Profile</CardTitle>
            <CardDescription className="text-white opacity-90">
              Enter a username to explore their GitHub activity and repositories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <Input
                placeholder="Enter GitHub username (e.g., octocat)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-grow py-6 px-4 border-2 focus:ring-2 focus:ring-offset-0"
                style={{ 
                  borderColor: THEME.accent, 
                  borderRadius: '8px',
                  outlineColor: THEME.primary,
                  fontSize: '16px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchGitHubData();
                }}
              />
              <Button 
                onClick={fetchGitHubData} 
                disabled={loading}
                className="text-white py-6 min-w-32"
                style={{ 
                  backgroundColor: THEME.primary,
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center mt-4 text-sm">
              <input
                type="checkbox"
                id="mock-data"
                checked={useMockData}
                onChange={() => setUseMockData(!useMockData)}
                className="mr-2"
                style={{ accentColor: THEME.primary }}
              />
              <label htmlFor="mock-data" style={{ color: THEME.textLight }}>
                Use demo data (avoids GitHub API rate limits)
              </label>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert className="mb-8 border-0" style={{ backgroundColor: '#FEE2E2', borderLeft: `4px solid #DC2626` }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-700">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}
        
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
              <div style={{ 
                backgroundColor: THEME.primary, 
                height: '80px', 
                borderRadius: '12px 12px 0 0'
              }} />
              
              <div className="flex justify-center -mt-10">
                <div className="rounded-full border-4 overflow-hidden" style={{ borderColor: 'white' }}>
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.login}'s avatar`}
                    className="w-20 h-20"
                  />
                </div>
              </div>
              
              <CardHeader className="text-center pt-2 pb-0">
                <CardTitle style={{ color: THEME.primary }}>{profile.name || profile.login}</CardTitle>
                <CardDescription className="text-sm font-medium" style={{ color: THEME.textLight }}>
                  @{profile.login}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {profile.bio && (
                  <p className="text-center mb-6 text-sm px-4" style={{ color: THEME.textDark }}>
                    {profile.bio}
                  </p>
                )}
                
                <div className="grid grid-cols-3 gap-2 text-center mb-6">
                  <div className="flex flex-col items-center p-3 rounded-lg" style={{ backgroundColor: `${THEME.accent}30` }}>
                    <BookOpen size={18} style={{ color: THEME.primary }} />
                    <p className="font-bold mt-1" style={{ color: THEME.primary }}>{profile.public_repos}</p>
                    <p className="text-xs" style={{ color: THEME.textLight }}>Repos</p>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg" style={{ backgroundColor: `${THEME.accent}30` }}>
                    <Users size={18} style={{ color: THEME.primary }} />
                    <p className="font-bold mt-1" style={{ color: THEME.primary }}>{profile.followers}</p>
                    <p className="text-xs" style={{ color: THEME.textLight }}>Followers</p>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg" style={{ backgroundColor: `${THEME.accent}30` }}>
                    <User size={18} style={{ color: THEME.primary }} />
                    <p className="font-bold mt-1" style={{ color: THEME.primary }}>{profile.following}</p>
                    <p className="text-xs" style={{ color: THEME.textLight }}>Following</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mb-2">
                  <Clock size={14} className="mr-1" style={{ color: THEME.textLight }} />
                  <span className="text-xs" style={{ color: THEME.textLight }}>
                    Member for {calculateAccountAge(profile.created_at)}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center pb-6">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`https://github.com/${profile.login}`, '_blank')}
                  style={{ 
                    borderColor: THEME.primary, 
                    color: THEME.primary,
                    borderRadius: '8px'
                  }}
                >
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-lg border-0 lg:col-span-2" style={{ borderRadius: '12px' }}>
              <CardHeader>
                <CardTitle style={{ color: THEME.primary }}>Commit Activity</CardTitle>
                <CardDescription>Contribution pattern over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commitActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: THEME.textLight }}
                        interval={4}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: THEME.textLight }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip 
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value) => [`${value} commits`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: `1px solid ${THEME.accent}`,
                          borderRadius: '4px'
                        }}
                        labelStyle={{ color: THEME.textDark, fontWeight: 'bold' }}
                        itemStyle={{ color: THEME.primary }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke={THEME.primary}
                        strokeWidth={3}
                        dot={{ r: 3, fill: THEME.primary, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: THEME.tertiary, stroke: THEME.primary, strokeWidth: 2 }}
                        name="Commits"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {repositories.length > 0 && (
          <Card className="shadow-lg border-0" style={{ borderRadius: '12px' }}>
            <CardHeader>
              <CardTitle style={{ color: THEME.primary }}>Repositories</CardTitle>
              <CardDescription>
                Showing {repositories.length} repositories for {profile?.login}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repositories.map((repo) => (
                  <Card 
                    key={repo.id} 
                    className="border shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{ borderRadius: '8px' }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg" style={{ color: THEME.primary }}>
                          {repo.name}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Badge variant="secondary" className="flex items-center" style={{ backgroundColor: `${THEME.accent}50`, color: THEME.primary }}>
                            <Star className="h-3 w-3 mr-1" />
                            {repo.stargazers_count}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center" style={{ backgroundColor: `${THEME.accent}50`, color: THEME.primary }}>
                            <GitFork className="h-3 w-3 mr-1" />
                            {repo.forks_count}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="mt-1">
                        Created on {formatDate(repo.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4" style={{ color: THEME.textDark, minHeight: '40px' }}>
                        {repo.description || 'No description available'}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        {repo.language && (
                          <Badge variant="outline" style={{ borderColor: getLanguageColor(repo.language) }}>
                            <span 
                              className="h-3 w-3 rounded-full mr-1" 
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            ></span>
                            {repo.language}
                          </Badge>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(repo.html_url, '_blank')}
                          style={{ color: THEME.primary }}
                        >
                          View Repository
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {!loading && !error && !profile && (
          <div className="text-center py-12">
            <div className="bg-violet-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Github size={48} style={{ color: THEME.primary }} />
            </div>
            <h3 className="text-xl font-medium mb-2" style={{ color: THEME.primary }}>
              Enter a GitHub Username
            </h3>
            <p style={{ color: THEME.textLight }}>
              Search for a GitHub user to see their profile, repositories and activity
            </p>
          </div>
        )}
        
        <footer className="text-center mt-12 pt-6 border-t" style={{ borderColor: '#f0f0f0' }}>
          <p className="text-sm" style={{ color: THEME.textLight }}>
            GitHubInsight • Elegant GitHub Profile Analytics
          </p>
        </footer>
      </div>
    </div>
  );
}
