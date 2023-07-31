export default function Avatar({userId,username}){
    const colors = ['bg-blue-200','bg-red-200','bg-teal-200','bg-orange-200','bg-yellow-200','bg-teal-200']

    const userIdbase10 = parseInt(userId,16)
    const colorIndex = (userIdbase10 % colors.length)
    const color= colors[colorIndex]
    return (
        <div className={`${color} w-8 h-8 bg-red-200 rounded-full flex items-center`}>
            <div className="text-center w-full opacity-70">{username[0]}</div>
        </div>
    )
}