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
import { motion } from 'framer-motion';
import { fadeIn } from '../src/variants';
import { bannerBg } from '../src/assets/weddingbg.jpg';
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
        <motion.div
          variants={fadeIn('down', 0.4)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: true, amount: 0.7 }}
          className=' bg-site bg-no-repeat bg-cover lg:bg-[#DFC2B0] overflow-hidden  pb-5 h-96 flex flex-col justify-center items-center gap-8'
        >
          <motion.p
            variants={fadeIn('down', 0.8)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: true, amount: 0.7 }}
            className='font-primary   text-[#544125] text-center font-bold w-screen px-2 py-5 text-4xl card'
          >
            Neka i tvoja slika bude dio uspomena
          </motion.p>
          <div className='flex gap-4 mt-5 items-center justify-center'>
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
        </motion.div>
        <motion.div
          variants={fadeIn('up', 1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: true, amount: 0.7 }}
          className='mt-12 mb-4 text-center font-bold bg-[#E4CCB8]/50 rounded-full px-4 py-2 w-2/4 mx-auto text-main text-2xl  '
        >
          Zadnjih 5 slika
        </motion.div>
        {imageUrls.map((url) => {
          return (
            <motion.img
              variants={fadeIn('up', 1.2)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: true, amount: 0.7 }}
              className='mx-auto mb-1'
              src={url}
              alt='uploaded'
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
