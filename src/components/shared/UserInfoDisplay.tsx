import { Models } from "appwrite";
import { Link } from "react-router-dom";

type UserInfoDisplayProps = {
  users: Models.Document[];
};

const UserInfoDisplay = ({ users }: UserInfoDisplayProps) => {
  return (
    <ul className="flex gap-5">
      {users.map((user) => (
        <li key={user.$id} className="user-info">
          <Link to={`/profile/${user.$id}`} className="user-info_link">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <p className="mt-2 text-center">@{user.username}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UserInfoDisplay;
