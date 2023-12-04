using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class rotate : MonoBehaviour {


	public float rotateSpeed = 15;
	public float targetSpeed = 15;
	public float t = 0.5f;

	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {

		rotateSpeed = Mathf.Lerp(targetSpeed, rotateSpeed, t);

		this.transform.RotateAround(Vector3.zero, Vector3.up, rotateSpeed * Time.deltaTime);
	}
}
