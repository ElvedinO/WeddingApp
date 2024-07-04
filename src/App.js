import './App.css';
import { useState, useEffect, useRef } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';
import { v4 } from 'uuid';
import { BsArrowRight, BsArrowDown } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { fadeIn } from '../src/variants';
import { dotPulse } from 'ldrs';

function App() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadTrigger, setUploadTrigger] = useState(0); // New state variable
  const [progress, setProgress] = useState(0); // Progress state
  const [loading, setLoading] = useState(true); // Loading state
  const imagesListRef = ref(storage, 'images/');
  const fileInputRef = useRef(null); // Create a reference for the file input

  dotPulse.register();
  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    const uploadTask = uploadBytesResumable(imageRef, imageUpload);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress); // Update progress state
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageUrls((prev) => [url, ...prev]); // Add new image URL to the beginning
          setUploadTrigger((prev) => prev + 1); // Trigger re-fetch
          fileInputRef.current.value = ''; // Clear the file input value
          setImageUpload(null); // Reset imageUpload state to null
          setProgress(0); // Reset progress state
        });
      }
    );
  };

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true); // Start loading
      const response = await listAll(imagesListRef);
      const promises = response.items.map((item) =>
        getMetadata(item).then((metadata) => ({
          item,
          timeCreated: metadata.timeCreated,
        }))
      );
      const itemsWithMetadata = await Promise.all(promises);
      itemsWithMetadata.sort(
        (a, b) => new Date(b.timeCreated) - new Date(a.timeCreated)
      );
      const lastFiveItems = itemsWithMetadata.slice(0, 5);
      // Fetch all URLs first
      const urlPromises = lastFiveItems.map(({ item }) => getDownloadURL(item));
      const urls = await Promise.all(urlPromises);
      // Update state once with all URLs
      setImageUrls(urls);
      setLoading(false); // End loading
    };
    fetchImages();
  }, [uploadTrigger]); // Add uploadTrigger as a dependency

  return (
    <div>
      <div className='relative'>
        <motion.div
          variants={fadeIn('down', 0.4)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: true, amount: 0.7 }}
          className='bg-site bg-no-repeat bg-cover overflow-hidden pb-5 h-screen flex flex-col justify-center items-center gap-8'
        >
          <motion.div
            variants={fadeIn('down', 0.8)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: true, amount: 0.7 }}
            className='flex flex-col items-center font-primary text-[#544125] text-center w-screen text-4xl'
          >
            <div className='bg-wedimg bg-cover bg-no-repeat overflow-hidden h-52 w-52 opacity-75'></div>
            <p className='card px-6 py-5'>
              Neka i tvoja slika bude dio uspomena
            </p>
          </motion.div>
          <div className='flex gap-4 items-center justify-center'>
            <motion.div
              variants={fadeIn('right', 1.4)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: true, amount: 0.7 }}
            >
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
            </motion.div>
            <motion.div
              variants={fadeIn('right', 2)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: true, amount: 0.7 }}
              className='flex items-center'
            >
              <BsArrowRight />
            </motion.div>
            <motion.button
              variants={fadeIn('right', 1.8)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: true, amount: 0.7 }}
              className='btn font-bold font-primary'
              onClick={uploadFile}
            >
              Podijeli sliku
            </motion.button>
          </div>
          {progress > 0 && (
            <div className='absolute top-[75vh] md:top-[65vh] lg:top-[70vh] w-full bg-gray-200 rounded-full h-4 mt-4'>
              <div
                className='bg-blue-600 h-4 rounded-full'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <motion.div
            variants={fadeIn('down', 2.5)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: true, amount: 0.1 }}
            className='absolute bottom-20 flex items-center justify-between bg-[#E4CCB8]/30 rounded-full px-4 py-2 w-3/4 mx-auto text-main text-2xl'
          >
            <BsArrowDown className='opacity-50' />
            <div>Zadnjih 5 slika</div>
            <BsArrowDown className='opacity-50' />
          </motion.div>
        </motion.div>
      </div>
      {loading ? (
        <div className=' flex justify-center items-center pb-5'>
          <l-dot-pulse size='43' speed='1.3' color='#544125'></l-dot-pulse>
        </div>
      ) : (
        imageUrls.map((url) => {
          return (
            <img
              className='mx-auto mb-1'
              src={url}
              alt='uploaded'
              loading='lazy'
            />
          );
        })
      )}
    </div>
  );
}

export default App;
