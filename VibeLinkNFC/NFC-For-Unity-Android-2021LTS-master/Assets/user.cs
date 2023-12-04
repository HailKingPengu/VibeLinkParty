using Firebase.Firestore;

[FirestoreData]
public struct user
{


    [FirestoreProperty]
    public string[] likes { get; set; }


    [FirestoreProperty]
    public string name { get; set; }


    [FirestoreProperty]
    public int score { get; set; }

    public user(string name, string[] likes)
    {
        this.name = name;
        this.likes = likes;
        this.score = 0;
    }

}
