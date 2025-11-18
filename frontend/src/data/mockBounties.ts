export interface Bounty {
  id: string
  companyId: string
  title: string
  description: string
  taskType: 'follow' | 'like' | 'share' | 'comment' | 'visit_location' | 'custom'
  rewardType: 'coupon' | 'discount' | 'free_item' | 'points'
  rewardDetails: string
  maxWinners: number
  currentCompletedCount: number
  status: 'active' | 'expired' | 'completed'
  startTime: string
  endTime: string
  location: { lat: number; lng: number } | null
  creatorId?: string // ID of the user who created this bounty
  company: {
    id: string
    name: string
    logo: string | null
  }
}

export const mockBounties: Bounty[] = [
  {
    id: '1',
    companyId: '1',
    title: 'Follow Our Instagram!',
    description: 'Follow @coolbrand on Instagram and get a 20% off coupon code!',
    taskType: 'follow',
    rewardType: 'coupon',
    rewardDetails: '20% off coupon code',
    maxWinners: 50,
    currentCompletedCount: 23,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: { lat: 40.7128, lng: -74.0060 }, // NYC
    company: {
      id: '1',
      name: 'Cool Brand',
      logo: null,
    },
  },
  {
    id: '2',
    companyId: '2',
    title: 'Like Our Facebook Page',
    description: 'Like our Facebook page and receive a free t-shirt!',
    taskType: 'like',
    rewardType: 'free_item',
    rewardDetails: 'Free t-shirt',
    maxWinners: 30,
    currentCompletedCount: 15,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    location: { lat: 34.0522, lng: -118.2437 }, // LA
    company: {
      id: '2',
      name: 'Awesome Company',
      logo: null,
    },
  },
  {
    id: '3',
    companyId: '3',
    title: 'Share Our Latest Post',
    description: 'Share our latest post on Twitter and get 100 reward points!',
    taskType: 'share',
    rewardType: 'points',
    rewardDetails: '100 reward points',
    maxWinners: 100,
    currentCompletedCount: 67,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    location: { lat: 41.8781, lng: -87.6298 }, // Chicago
    company: {
      id: '3',
      name: 'Tech Startup',
      logo: null,
    },
  },
  {
    id: '4',
    companyId: '4',
    title: 'Visit Our Store Location',
    description: 'Visit our store in downtown and get a free coffee!',
    taskType: 'visit_location',
    rewardType: 'free_item',
    rewardDetails: 'Free coffee',
    maxWinners: 20,
    currentCompletedCount: 8,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    company: {
      id: '4',
      name: 'Local Cafe',
      logo: null,
    },
  },
]


