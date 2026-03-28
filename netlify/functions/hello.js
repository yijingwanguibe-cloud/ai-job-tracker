exports.handler = async (event) => {
  console.log('Hello function called!');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions!', timestamp: new Date().toISOString() })
  };
};
