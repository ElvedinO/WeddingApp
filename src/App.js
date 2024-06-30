import './App.css';
import { useState, useEffect, useRef } from 'react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';
import { v4 } from 'uuid';
import { BsArrowRight } from 'react-icons/bs';

function App() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadTrigger, setUploadTrigger] = useState(0); // New state variable
  const imagesListRef = ref(storage, 'images/');
  const fileInputRef = useRef(null); // Create a reference for the file input

  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [url, ...prev]); // Add new image URL to the beginning
        setUploadTrigger((prev) => prev + 1); // Trigger re-fetch
        fileInputRef.current.value = ''; // Clear the file input value
        setImageUpload(null); // Reset imageUpload state to null
      });
    });
  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      const promises = response.items.map((item) =>
        getMetadata(item).then((metadata) => ({
          item,
          timeCreated: metadata.timeCreated,
        }))
      );

      Promise.all(promises).then((itemsWithMetadata) => {
        itemsWithMetadata.sort(
          (a, b) => new Date(b.timeCreated) - new Date(a.timeCreated)
        );
        const lastFiveItems = itemsWithMetadata.slice(0, 5);

        const urlPromises = lastFiveItems.map(({ item }) =>
          getDownloadURL(item)
        );
        Promise.all(urlPromises).then((urls) => {
          setImageUrls(urls);
        });
      });
    });
  }, [uploadTrigger]); // Add uploadTrigger as a dependency

  return (
    <div className=''>
      <div className='App'>
        <p className='font-primary text-center font-bold bg-main/30 w-screen px-4 py-2'>
          Neka i tvoja slika bude dio uspomena
        </p>
        <div className='flex gap-4 mt-5 items-center justify-center'>
          <div>
            <label title='Click to upload' htmlFor='button2'>
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
              ref={fileInputRef} // Attach the reference to the file input
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
          return <img className='mx-auto mb-1' src={url} alt='uploaded' />;
        })}
      </div>
    </div>
  );
}

export default App;
