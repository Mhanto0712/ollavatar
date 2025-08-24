import React from 'react';
import { logout } from '@/components/api';

interface NavProps {
  isLogin: '' | boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
}

const Nav: React.FC<NavProps> = ({ isLogin, setIsLogin, setAccessToken }) => {
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await logout();
      alert(data.message);
      setIsLogin(false);
      setAccessToken('');
    } catch (error: any) {
      alert(error?.detail);
    }
  };

  return (
    <nav className='w-full h-[5%] flex items-center justify-between p-4'>
      <div className='size-fit'>
        <ul>
          <li>
            <a className='block font-bold text-2xl' href='#'>
              Ollavatar
            </a>
          </li>
        </ul>
      </div>
      <div className='size-fit'>
        {isLogin ? (
          <ul className='flex'>
            <li>
              <a
                className='block text-xl cursor-pointer'
                onClick={handleLogout}
              >
                登出
              </a>
            </li>
          </ul>
        ) : null}
      </div>
    </nav>
  );
};

export default Nav;
