let students = [
    { name: "Vedant Joshi", marks: 85 },
    { name: "Yugank Rathore", marks: 92 },
    { name: "Samuel Biju", marks: 78 },
    { name: "Aarush Kumar", marks: 88 }
];
for (let i = 0; i < students.length; i++) {
    if (students[i].marks < 40) {
        continue;
    }
    console.log(students[i].name + " passed with " + students[i].marks + " marks.");
}
// Vedant Joshi passed with 85 marks.
// Yugank Rathore passed with 92 marks.
// Samuel Biju passed with 78 marks.
// Aarush Kumar passed with 88 marks.
