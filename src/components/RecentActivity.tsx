// import { Avatar } from "lucide-react"; // Removed as unused and non-existent


const activities = [
    {
        id: 1,
        user: "Alice Johnson",
        action: "purchased",
        target: "Premium Plan",
        time: "2 mins ago",
        amount: "+$99.00",
        avatar: "bg-blue-500",
    },
    {
        id: 2,
        user: "Bob Smith",
        action: "commented on",
        target: "Project X",
        time: "15 mins ago",
        amount: "",
        avatar: "bg-purple-500",
    },
    {
        id: 3,
        user: "Charlie Brown",
        action: "subscribed to",
        target: "Newsletter",
        time: "1 hour ago",
        amount: "+$0.00",
        avatar: "bg-orange-500",
    },
    {
        id: 4,
        user: "David Wilson",
        action: "requested",
        target: "Refund",
        time: "3 hours ago",
        amount: "-$49.00",
        avatar: "bg-red-500",
    },
];

export function RecentActivity() {
    return (
        <div className="glass-card p-6 rounded-2xl h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <button className="text-sm text-primary hover:text-primary/80">View All</button>
            </div>

            <div className="space-y-6">
                {activities.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${item.avatar} flex items-center justify-center text-white font-bold text-sm bg-opacity-20 border border-white/10 shadow-inner`}>
                            {item.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white font-medium">
                                {item.user} <span className="text-muted-foreground font-normal">{item.action}</span> <span className="text-primary">{item.target}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                        </div>
                        {item.amount && (
                            <span className={`text-sm font-medium ${item.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {item.amount}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
