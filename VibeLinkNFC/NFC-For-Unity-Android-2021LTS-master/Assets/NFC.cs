using System.Collections;
using System.Collections.Generic;
using System;
using System.Reflection;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;
using Firebase.Firestore;
using Firebase.Extensions;
using System.Drawing;

public class NFC : MonoBehaviour
{

    public string tagID;
    public Text tag_output_text;
    public bool tagFound = false;
    public CodeTranslator codeTranslator;

    public rotate rotate;

    private AndroidJavaObject mActivity;
    private AndroidJavaObject mIntent;
    private AndroidJavaObject pendingIntent;
    private string sAction;

    private int writeText;
    private user userToWrite;
    private string debugText;

    [SerializeField] private string fauxInput;
    [SerializeField] private bool fauxGo;

    [SerializeField] private List<string> lastResults;

    FirebaseFirestore fs;

    [SerializeField] LogoRotateScript logoR;


    void Start()
    {

        fs = FirebaseFirestore.DefaultInstance;

        tag_output_text.text = "Scan an NFC tag to display the linked user!";


        //mActivity = new AndroidJavaClass("com.unity3d.player.UnityPlayer").GetStatic<AndroidJavaObject>("currentActivity"); // Activities open apps

        //pendingIntent = new AndroidJavaClass("android.app.PendingIntent").Call<AndroidJavaObject>("getActivity", new AndroidJavaObject[]{ mActivity, 0,  ;
    }

    user readData(string input)
    {
        fs = FirebaseFirestore.DefaultInstance;

        DocumentReference docRef = fs.Collection("users").Document(input);

        logoR.rotating = true;

        //Debug.Log(docRef);

        docRef.GetSnapshotAsync().ContinueWith((task) =>
        {

            logoR.rotating = false;

            var snapshot = task.Result;
            if (snapshot.Exists)
            {
                Debug.Log(String.Format("Document data for {0} document:", snapshot.Id));
                user user = snapshot.ConvertTo<user>();
                //Debug.Log(String.Format("Name: {0}", user.name));

                //writeOutput(user);

                writeText = 1;
                userToWrite = user;

                return user;
            }
            else
            {
                Debug.Log(String.Format("Document {0} does not exist!", snapshot.Id));

                writeText = 2;
                //userToWrite = user;

                debugText = docRef.ToString();
                //Debug.Log(docRef);

                return new user();
            }
        });

        //Debug.Log("how did we get here?");

        return new user();

    }

    void Update()
    {

        if(writeText > 0)
        {

            if(writeText == 1)
            {
                writeOutput(userToWrite);
            }
            else if(writeText == 2)
            {
                tag_output_text.text = "no user found at this address!";
                //tag_output_text.text = debugText;
            }

            writeText = 0;

        }

        if (fauxGo)
        {
            fauxGo = false;

            readData(fauxInput);

            //user outputUser = readData(fauxInput);

            //if (outputUser.name == null)
            //{
            //    tag_output_text.text = "no user found! (or user has no name)";
            //}
            //else
            //{

            //    tag_output_text.text = "name: " + outputUser.name + "\nlikes:\n";

            //    foreach (string like in outputUser.likes)
            //    {
            //        tag_output_text.text += like + "\n";
            //    }
            //}
        }

        //tag_output_text.text = "";

        //for (int i = 0; i < lastResults.Count; i++)
        //{
        //    tag_output_text.text += lastResults[i] + "\n";
        //}


        if (Application.platform == RuntimePlatform.Android)
        {
            if (!tagFound)
            {

                bool resultGot = false;
                //string

                try
                {
                    // Create new NFC Android object
                    mActivity = new AndroidJavaClass("com.unity3d.player.UnityPlayer").GetStatic<AndroidJavaObject>("currentActivity"); // Activities open apps
                    mIntent = mActivity.Call<AndroidJavaObject>("getIntent");
                    
                    sAction = mIntent.Call<String>("getAction"); // results are returned in the Intent object
                    if (sAction == "android.nfc.action.NDEF_DISCOVERED")
                    {
                        Debug.Log("Tag of type NDEF");
                        AndroidJavaObject[] rawMsg = mIntent.Call<AndroidJavaObject[]>("getParcelableArrayExtra", "android.nfc.extra.NDEF_MESSAGES");
                        AndroidJavaObject[] records = rawMsg[0].Call<AndroidJavaObject[]>("getRecords");
                        byte[] payLoad = records[0].Call<byte[]>("getPayload");
                        string result = System.Text.Encoding.Default.GetString(payLoad);

                        //bool noDuplicate = true;
                        //for(int i = 0; i < lastResults.Count; i++)
                        //{
                        //    if (result == lastResults[i])
                        //    {
                        //        noDuplicate = false;
                        //    }
                        //}

                        //user outputUser = codeTranslator.insertCode(result);

                        //user outputUser = readData(result);

                        string[] resultSplit = result.Split("-");

                        readData(resultSplit[1]);

                        Debug.Log("Reading user data... hold on!");

                        //if (noDuplicate)
                        //{
                        //    lastResults.Add(result);
                        //}

                        rotate.rotateSpeed = 500;

                        //tag_output_text.text = result;// + lastResults.Count.ToString(); // first few letters are about used language (for english "en..")
                    }
                    else if (sAction == "android.nfc.action.TECH_DISCOVERED")
                    {
                        Debug.Log("TAG DISCOVERED");
                        // Get ID of tag
                        AndroidJavaObject mNdefMessage = mIntent.Call<AndroidJavaObject>("getParcelableExtra", "android.nfc.extra.TAG");
                        if (mNdefMessage != null)
                        {
                            byte[] payLoad = mNdefMessage.Call<byte[]>("getId");
                            string text = System.Convert.ToBase64String(payLoad);
                            tag_output_text.text += "This is your tag text: " + text;
                            rotate.rotateSpeed = 500;
                            tagID = text;
                        }
                        else
                        {
                            tag_output_text.text = "No ID found !";
                        }
                        tagFound = true;
                        // How to read multiple tags maybe with this line mIntent.Call("removeExtra", "android.nfc.extra.TAG");
                        return;
                    }
                    else if (sAction == "android.nfc.action.TAG_DISCOVERED")
                    {
                        Debug.Log("This type of tag is not supported !");

                        rotate.rotateSpeed = -500;
                    }
                    else
                    {
                        //if (lastResults.Count > 0)
                        //{
                        //    tag_output_text.text = "";

                        //    for (int i = 0; i < lastResults.Count; i++)
                        //    {
                        //        tag_output_text.text += lastResults[i] + "\n";
                        //    }
                        //}
                        //else
                        //{
                        //    tag_output_text.text = "Scan a NFC tag to make the cube spin!";
                        //}
                        //return;
                    }
                }
                catch (Exception ex)
                {
                    string text = ex.Message;
                    tag_output_text.text = text;
                }

                //if (resultGot)
                //{
                    
                //    //tag_output_text.text = lastResult;
                //}

                //tag_output_text.text = "";

                //for(int i = 0; i < lastResults.Count; i++)
                //{
                //    tag_output_text.text += lastResults[i];
                //}

                mIntent.Call<AndroidJavaObject>("setAction", "");
            }
        }
    }

    void writeOutput(user outputUser)
    {

        Debug.Log("writing...");

        if (outputUser.name == null && outputUser.likes.Length == 0)
        {

            Debug.Log("a...");
            tag_output_text.text = "this is an empty user!";
        }
        else
        {

            Debug.Log("b...");
            tag_output_text.text = "<b><size=70>name:</size></b> \n" + outputUser.name + "\n<b><size=70>likes:</size></b>\n";

            foreach (string like in outputUser.likes)
            {
                tag_output_text.text += like + "\n";
            }
        }
    }

}