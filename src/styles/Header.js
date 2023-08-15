import * as React from 'react';

export function DefaultHeader({ text, onClick }) {
  return (
    <div className='flex gap-1 flex-row'>
      <button className='bg-transparent w-4'>
        <img src='arrow_back.svg' alt='back'></img>
      </button>
      <div className='border-x-neutral-900'>{text}</div>
    </div>
  );
}
