using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CodeTranslator : MonoBehaviour
{

    //format: name - num likes - likes

    //EXAMPLE: en-joenis bidome-nuts.pizza.chestershire.all the people

    InputField nameInput;

    List<InputField> likesInputs;



    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public user insertCode(string code)
    {
        string[] splitStrings = code.Split("-");
        string[] splitLikes = splitStrings[2].Split(".");
        return new user(splitStrings[1], splitLikes);
    }

    //public string produceCode()
    //{

        
    //}

}
