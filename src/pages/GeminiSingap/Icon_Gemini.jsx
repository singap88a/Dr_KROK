import { Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

export default function AI_Icon() {


    return (
      <div
        className="fixed z-50 cursor-pointer bottom-6 left-6"
       >
        <Link to="/gemini">
                <div className="p-2 transition-all rounded-full shadow-lg bg-primary hover:shadow-xl hover:scale-110">
          {/* Gemini Icon */}
          <FaRobot className="w-8 h-8 text-white" />
        </div>
        </Link>

      </div>
    );
  }
