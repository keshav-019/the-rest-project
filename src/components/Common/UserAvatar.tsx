export default function UserAvatar ({ initials }: { initials: string }) {
    return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer">
            {initials}
        </div>
    );
};