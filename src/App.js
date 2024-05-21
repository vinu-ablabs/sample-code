import { Amplify, Auth } from "aws-amplify";
import { useRef, useState } from "react";
import "./App.css";
import awsConfig from "./aws-exports";
import { uploadDocumentToS3Bucket } from "./util";

function App() {
  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );

  const [localRedirectSignIn] = awsConfig.oauth.redirectSignIn.split(",");
  const [localRedirectSignOut] = awsConfig.oauth.redirectSignOut.split(",");

  Amplify.configure({
    ...awsConfig,
    oauth: {
      ...awsConfig.oauth,
      redirectSignIn: isLocalhost ? localRedirectSignIn : "",
      redirectSignOut: isLocalhost ? localRedirectSignOut : "",
    },
  });

  const [loginCreds, setCreds] = useState({ email: "", pass: "" });
  const [signedInUser, setSignedInUser] = useState(undefined);

  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileDetails = Array.from(selectedFiles).map((file) => {
        const attachmentUniqueId = Math.random();
        const fileNameSplits = file.name.split(".");
        return {
          url: URL.createObjectURL(file),
          fileName: fileNameSplits[0],
          fileExtension: fileNameSplits[fileNameSplits.length - 1],
          mdAttachmentType: file.type.includes("image")
            ? DocumentType.Image
            : DocumentType.PDF,
          attachmentId: "",
          id: attachmentUniqueId,
        };
      });
      fileDetails.map(async (data) => {
        const uploadDocumentResponse = await uploadDocumentToS3Bucket(
          `vendor/test-vendor/bid-attachments/test-bid/version0}/${data?.id}.${data?.fileExtension}`,
          data?.url ?? "",
          {
            level: "public",
          },
          data?.fileExtension
        );
        console.log(uploadDocumentResponse.key);
        return uploadDocumentResponse;
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!signedInUser && (
          <>
            <input
              placeholder="email"
              onChange={(e) => {
                const email = e.target.value;
                loginCreds.email = email;
                setCreds(loginCreds);
              }}
            />
            <input
              placeholder="password"
              onChange={(e) => {
                const pass = e.target.value;
                loginCreds.pass = pass;
                setCreds(loginCreds);
              }}
            />
            <button
              onClick={async () => {
                console.log(loginCreds);
                const signInResponse = await Auth.signIn(
                  loginCreds.email,
                  loginCreds.pass
                );
                setSignedInUser(signInResponse);
              }}
            >
              Login
            </button>
          </>
        )}

        {signedInUser && (
          <>
            <text>Welcome {JSON.stringify(signedInUser.attributes.name)}</text>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf, .jpg, .jpeg, .png"
              multiple
              onChange={handleFileChange}
            />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
