import { Outlet } from 'react-router';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#2563eb] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AulaFácil</h1>
          <p className="text-gray-600 mt-2">University Classroom Reservation System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
