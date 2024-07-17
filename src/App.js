import './App.css';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageSelected, setImageSelected] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // New state variable
  const imagesListRef = ref(storage, 'images/');
  const fileInputRef = useRef(null);

  dotPulse.register();

  const uploadFile = useCallback(() => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    const uploadTask = uploadBytesResumable(imageRef, imageUpload);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageUrls((prev) => [url, ...prev]);
          setUploadTrigger((prev) => prev + 1);
          fileInputRef.current.value = '';
          setImageUpload(null);
          setProgress(0);
          setImageSelected(false);
          setUploadSuccess(true); // Set upload success to true
        });
      }
    );
  }, [imageUpload]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await listAll(imagesListRef);
        const itemsWithMetadata = await Promise.all(
          response.items.map(async (item) => {
            const metadata = await getMetadata(item);
            const url = await getDownloadURL(item);
            return { url, timeCreated: metadata.timeCreated };
          })
        );

        itemsWithMetadata.sort(
          (a, b) => new Date(b.timeCreated) - new Date(a.timeCreated)
        );
        const lastFiveItems = itemsWithMetadata.slice(0, 5);
        const urls = lastFiveItems.map((item) => item.url);
        setImageUrls(urls);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [uploadTrigger]);

  return (
    <div>
      <div className='relative h-[100svh]'>
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
          <div className='flex relative gap-4 items-center justify-center'>
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
                hidden={true}
                type='file'
                name='button2'
                id='button2'
                ref={fileInputRef}
                onChange={(event) => {
                  setImageUpload(event.target.files[0]);
                  setImageSelected(true);
                  setUploadSuccess(false); // Reset upload success on new selection
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

            {progress > 0 && (
              <div className='absolute top-16 w-full bg-gray-200 rounded-full h-4 mt-4'>
                <div
                  className='bg-blue-600 h-4 rounded-full'
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            {imageSelected && (
              <p className='absolute top-12 text-green-400'>
                Uspješno ste izabrali sliku. Pritisnite na Podijeli sliku.
              </p>
            )}
            {uploadSuccess && (
              <p className='absolute top-12 text-green-500'>
                Hvala Vam! Slika je uspješno podijeljena.
              </p>
            )}
          </div>

          <motion.div
            variants={fadeIn('down', 2.5)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: true, amount: 0.1 }}
            className='absolute bottom-[2vh] flex items-center justify-between bg-[#E4CCB8]/30 rounded-full px-4 py-2 w-3/4 mx-auto text-main text-2xl'
          >
            <BsArrowDown className='opacity-50' />
            <div>Zadnjih 5 slika</div>
            <BsArrowDown className='opacity-50' />
          </motion.div>
        </motion.div>
      </div>
      {loading ? (
        <div className='flex justify-center items-center pb-5'>
          <l-dot-pulse size='43' speed='1.3' color='#544125'></l-dot-pulse>
        </div>
      ) : (
        imageUrls.map((url) => (
          <motion.img
            variants={fadeIn('up', 0.5)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: true, amount: 0.1 }}
            key={url}
            className='mx-auto mb-1 lg:w-1/2 px-1 rounded-2xl'
            src={url}
            alt='uploaded'
            loading='lazy'
          />
        ))
      )}
    </div>
  );
}

export default App;
