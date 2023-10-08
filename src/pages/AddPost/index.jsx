import React from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '../../redux/slices/auth';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios';
import { isEditable } from '@testing-library/user-event/dist/utils';

export const AddPost = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  React.useEffect(() => {
    if (id) {
      axios
        .get(`posts/${id}`)
        .then(({ data }) => {
          setTags(data.tags.join(','));
          setTitle(data.title);
          setValue(data.text);
          setImageUrl(data.imageUrl);
        })
        .catch((err) => console.warn(err));
    }
  }, []);

  const navigate = useNavigate();

  const inputImageRef = React.useRef(null);

  const [loading, setLoading] = React.useState(false);

  const [text, setValue] = React.useState('');

  const [title, setTitle] = React.useState('');

  const [tags, setTags] = React.useState('');

  const [imageUrl, setImageUrl] = React.useState('');

  const isAuth = useSelector(selectIsAuth);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];
      formData.append('image', file);
      const { data } = await axios.post('/uploads', formData);
      setImageUrl(data.url);
    } catch (error) {
      console.warn(error);
      alert('Ошибка загрузки');
    }
  };

  const onClickRemoveImage = () => {
    setImageUrl('');
  };

  const onChange = React.useCallback((value) => {
    setValue(value);
  }, []);

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );
  console.log({ text, tags, title });

  const onSubmit = async () => {
    try {
      setLoading(true);
      const files = {
        imageUrl,
        text,
        tags,
        title,
      };
      const { data } = isEdit
        ? await axios.patch(`/posts/${id}`, files)
        : await axios.post('/posts', files);
      const _id = isEdit ? id : data._id;
      navigate(`/posts/${_id}`);
    } catch (error) {
      console.warn(error);
      alert('Ошибка загрузки');
    }
  };

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/" />;
  }
  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputImageRef.current.click()} variant="outlined" size="large">
        Загрузить превью
      </Button>
      <input ref={inputImageRef} type="file" onChange={handleChangeFile} hidden />
      {imageUrl && (
        <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
            Удалить
          </Button>
          <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt="Uploaded" />
        </>
      )}

      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        fullWidth
      />
      <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options} />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEdit ? 'Сохранить' : 'Опубликовать'}
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
