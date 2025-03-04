
import React from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  registration_time: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  notes?: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    profile_image_url: string | null;
  } | null;
}

interface Event {
  id: string;
  title: string;
  date: string;
  current_volunteers: number;
  volunteers_needed: number;
}

interface VolunteerAnalyticsProps {
  registrations: Registration[];
  events: Event[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A460ED', '#FF6B6B'];

const VolunteerAnalytics: React.FC<VolunteerAnalyticsProps> = ({ registrations, events }) => {
  // Process data for registration timeline
  const getRegistrationsByDay = () => {
    if (!registrations?.length) return [];
    
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    // Create a map of dates with counts
    const dateCounts: Record<string, number> = {};
    for (let i = 0; i <= 30; i++) {
      const date = subDays(now, i);
      dateCounts[format(date, 'yyyy-MM-dd')] = 0;
    }
    
    // Count registrations by day
    registrations.forEach(reg => {
      if (!reg.registration_time) return;
      
      const regDate = parseISO(reg.registration_time);
      if (regDate >= thirtyDaysAgo) {
        const dateKey = format(regDate, 'yyyy-MM-dd');
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dateCounts)
      .map(([date, count]) => ({
        date,
        count,
        formattedDate: format(parseISO(date), 'MMM d')
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  };
  
  // Process data for event fill rates
  const getEventFillRates = () => {
    if (!events?.length) return [];
    
    return events
      .filter(event => event.volunteers_needed > 0)
      .map(event => ({
        name: event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title,
        fullTitle: event.title,
        fillRate: Math.round((event.current_volunteers / event.volunteers_needed) * 100),
        volunteers: event.current_volunteers,
        capacity: event.volunteers_needed
      }))
      .sort((a, b) => b.fillRate - a.fillRate)
      .slice(0, 8); // Top 8 events
  };
  
  // Process dietary restrictions data
  const getDietaryData = () => {
    if (!registrations?.length) return [];
    
    const restrictions: Record<string, number> = {};
    let noRestrictionsCount = 0;
    
    registrations.forEach(reg => {
      if (!reg.dietary_restrictions) {
        noRestrictionsCount++;
        return;
      }
      
      const restriction = reg.dietary_restrictions.trim();
      if (restriction === '') {
        noRestrictionsCount++;
        return;
      }
      
      restrictions[restriction] = (restrictions[restriction] || 0) + 1;
    });
    
    // Add "None" category
    if (noRestrictionsCount > 0) {
      restrictions['None'] = noRestrictionsCount;
    }
    
    return Object.entries(restrictions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  const registrationTimeline = getRegistrationsByDay();
  const eventFillRates = getEventFillRates();
  const dietaryData = getDietaryData();
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Volunteer Analytics</h2>
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Registration Timeline</TabsTrigger>
          <TabsTrigger value="fillRates">Event Fill Rates</TabsTrigger>
          <TabsTrigger value="dietary">Dietary Needs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          <h3 className="text-lg font-medium">Volunteer Registrations (Last 30 days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={registrationTimeline}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} registrations`, 'Count']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Total registrations in last 30 days: {registrationTimeline.reduce((sum, day) => sum + day.count, 0)}
          </p>
        </TabsContent>
        
        <TabsContent value="fillRates" className="space-y-4">
          <h3 className="text-lg font-medium">Event Fill Rates</h3>
          {eventFillRates.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventFillRates}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    label={{ value: 'Fill Rate (%)', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'fillRate') return [`${value}%`, 'Fill Rate'];
                      return [value, name];
                    }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? item.fullTitle : label;
                    }}
                  />
                  <Bar dataKey="fillRate" fill="#8884d8" name="Fill Rate">
                    {eventFillRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No event data available</p>
          )}
        </TabsContent>
        
        <TabsContent value="dietary" className="space-y-4">
          <h3 className="text-lg font-medium">Volunteer Dietary Needs</h3>
          {dietaryData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dietaryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dietaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} volunteers`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No dietary data available</p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VolunteerAnalytics;
