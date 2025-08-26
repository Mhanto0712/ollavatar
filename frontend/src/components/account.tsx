'use client';

import { useState } from 'react';
import { isToken, signUp, logIn, updateOllamaUrl } from '@/components/api';
import { CircleX } from 'lucide-react';

type AccountProps = {
  isLogin: '' | boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  isOllamaUrl: boolean;
  setIsOllamaUrl: React.Dispatch<React.SetStateAction<boolean>>;
};

const Account = ({
  isLogin,
  setIsLogin,
  accessToken,
  setAccessToken,
  isOllamaUrl,
  setIsOllamaUrl,
}: AccountProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      try {
        if (activeTab === 'signup') {
          if (process.env.NODE_ENV === 'development') {
            if (!username || !password) {
              alert('用戶名與密碼不得為空！');
              return;
            }

            const data = await signUp(username, password);
            alert(data.message);
            setActiveTab('login');
          } else {
            alert('此功能尚未開啟！');
            setActiveTab('login');
          }
        } else if (activeTab === 'login') {
          if (!username || !password) {
            alert('用戶名與密碼不得為空！');
            return;
          }

          const data = await logIn(username, password);
          alert(data.message);
          setIsLogin(true);
          setAccessToken(data.access_token);
        }
      } catch (error: any) {
        if (
          error?.detail == '用戶名已註冊！' ||
          error?.detail == '此功能尚未開啟！' ||
          error?.detail == '用戶名錯誤！' ||
          error?.detail == '密碼錯誤！'
        ) {
          alert(error?.detail);
        } else {
          alert(`請聯絡管理員！\n${error?.detail || error}`);
        }
      }
    } else {
      try {
        await isToken(
          setIsLogin,
          accessToken,
          setAccessToken,
          async (access_token) => {
            await updateOllamaUrl(ollamaUrl, access_token);
            setIsOllamaUrl(true);
          }
        );
      } catch (error: any) {
        if (
          error?.detail == '更新憑證不存在' ||
          error?.detail == '更新憑證已過期'
        ) {
          alert('請重新登入');
        } else if (
          error?.detail == '請輸入網址格式！' ||
          error?.detail == '請更新正確的 Ollama URL ！'
        ) {
          alert(error?.detail);
        } else {
          alert(`請聯絡管理員！\n${error?.detail || error}`);
        }
      }
    }
  };

  return (
    <div className='fixed top-0 left-0 z-75 w-full h-full flex items-center justify-center'>
      <div className='z-0 absolute w-full h-full bg-black opacity-80 flex justify-center items-center'></div>
      <div className='z-1 w-1/2 h-1/2 bg-gray-900 flex flex-col items-center justify-center rounded-lg'>
        <div className='w-full h-1/10 flex'>
          {!isLogin ? (
            <>
              <button
                onClick={() => setActiveTab('signup')}
                className={`w-full h-full p-2 text-xl transition-colors cursor-pointer
      ${
        activeTab === 'signup'
          ? 'bg-gray-950 text-white'
          : 'bg-white text-black hover:bg-gray-900 hover:text-white active:bg-gray-950'
      }`}
              >
                註冊
              </button>

              <button
                onClick={() => setActiveTab('login')}
                className={`w-full h-full p-2 text-xl transition-colors cursor-pointer
      ${
        activeTab === 'login'
          ? 'bg-gray-950 text-white'
          : 'bg-white text-black hover:bg-gray-900 hover:text-white active:bg-gray-950'
      }`}
              >
                登入
              </button>
            </>
          ) : (
            /* 輸入 Ollama URL */
            <div className='relative w-full h-full'>
              <button className='w-full h-full p-2 text-xl text-center bg-gray-950 text-white'>
                Ollama URL
              </button>
              <CircleX
                onClick={() => setIsOllamaUrl(true)}
                className='absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-auto aspect-square text-gray-500 hover:text-gray-300 cursor-pointer'
              />
            </div>
          )}
        </div>
        <form
          onSubmit={handleLogin}
          className='flex flex-col justify-center items-center gap-4 p-4 w-full h-9/10 text-xl text-black'
        >
          {!isLogin ? (
            <>
              <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-4/5 bg-white p-2 rounded appearance-none'
              />
              <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-4/5 bg-white border p-2 rounded'
              />
            </>
          ) : (
            <input
              type='url'
              placeholder='Ollama URL'
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className='w-4/5 bg-white border p-2 rounded'
            />
          )}
          <button
            type='submit'
            className='w-4/5 bg-gray-500 text-white rounded p-2 transition-colors cursor-pointer hover:bg-gray-950 active:bg-gray-950'
          >
            {!isLogin ? (activeTab === 'signup' ? '註冊' : '登入') : '送出'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;
