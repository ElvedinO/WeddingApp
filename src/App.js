import './App.css';
import { useState, useEffect } from 'react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
} from 'firebase/storage';
import { storage } from './firebase';
import { v4 } from 'uuid';
import { BsArrowRight } from 'react-icons/bs';
function App() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const imagesListRef = ref(storage, 'images/');
  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url]);
      });
    });
  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  return (
    <div className=''>
      <div className='App'>
        <p className=' font-primary text-center font-bold bg-main/30  w-screen px-4 py-2'>
          Neka i tvoja slika bude dio uspomena
        </p>
        <div className='flex gap-4 mt-5 items-center justify-center'>
          <div>
            <label title='Click to upload' for='button2'>
              <div>
                <span className='text-main btn font-primary font-bold'>
                  Izaberi sliku
                </span>
              </div>
            </label>
            <input
              hidden='true'
              type='file'
              name='button2'
              id='button2'
              onChange={(event) => {
                setImageUpload(event.target.files[0]);
              }}
            />
          </div>
          <div className='flex items-center'>
            <BsArrowRight />
          </div>

          <button className='btn font-bold font-primary' onClick={uploadFile}>
            Podijeli sliku
          </button>
        </div>
        <div className='mt-12 mb-4 text-center font-bold bg-main/30 rounded-full px-4 py-2 w-2/4 mx-auto '>
          Zadnjih 5 slika
        </div>
        {imageUrls.map((url) => {
          return <img className=' lg:mx-auto mb-1' src={url} />;
        })}
      </div>
    </div>
  );
}

export default App;
