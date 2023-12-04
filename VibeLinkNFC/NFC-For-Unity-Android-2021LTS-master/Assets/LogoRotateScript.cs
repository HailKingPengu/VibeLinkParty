using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LogoRotateScript : MonoBehaviour
{

    [SerializeField] private RectTransform tf;
    public bool rotating;
    [SerializeField] private float rate;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (rotating)
        {
            tf.Rotate(new Vector3(0, 0, rate*Time.deltaTime));
        }
        else
        {
            //tf.rotation.eulerAngles.Set(0, 0, 0);

            tf.rotation = Quaternion.identity;
        }
    }
}
