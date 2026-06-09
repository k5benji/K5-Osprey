export async function handler(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Notebook API endpoint is live',
      method: event.httpMethod,
    }),
  };
}
