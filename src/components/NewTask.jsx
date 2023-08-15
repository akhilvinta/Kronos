import React from 'react';
import { DefaultHeader } from '../styles/Header';

const NewTask = () => {
  return (
    <div className='w-128'>
      <DefaultHeader
        text={'New Task'}
        onClick={() => console.log('run')}
      ></DefaultHeader>
    </div>
  );
};

export default NewTask;
