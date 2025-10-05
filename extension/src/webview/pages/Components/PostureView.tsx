function PostureView() {
  return (
    <>
      <div className="flex flex-col items-center mx-auto mt-10 w-11/12 max-w-3xl m-3 bg-white rounded-lg border border-yellow-950 shadow-md p-10">
        <h1 className="font-sans font-bold text-lg text-gray-800">
          Posture Reminder
        </h1>
        <p className="font-sans text-base text-gray-800">
          Set a regular reminder to adjust your posture.
        </p>
        <div className="flex flex-col items-center mx-aut pt-10">
          <p className="font-sans text-xl text-gray-800">Remind me every</p>
          <input
            type="number"
            className="bg-yellow-100 border rounded-lg- p-2 text-gray-800"
          ></input>
          <p className="font-sans text-xl text-gray-800">minutes</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Button
          </button>
        </div>
      </div>
    </>
  );
}

export default PostureView;
