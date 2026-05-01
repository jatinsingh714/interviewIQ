import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

(async () => {
  try {
    const response = await axios.post('https://openrouter.ai/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      validateStatus: null,
    });
    console.log('status', response.status);
    console.log('content-type', response.headers['content-type']);
    console.log('data type', typeof response.data);
    if (typeof response.data === 'string') {
      console.log(response.data.slice(0, 2000));
    } else {
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (err) {
    console.error('error', err.message);
    if (err.response) {
      console.error('resp status', err.response.status);
      console.error('resp headers', err.response.headers['content-type']);
      if (typeof err.response.data === 'string') {
        console.error(err.response.data.slice(0, 2000));
      } else {
        console.error(JSON.stringify(err.response.data, null, 2));
      }
    }
  }
})();