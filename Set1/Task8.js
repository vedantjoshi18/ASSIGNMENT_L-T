let students = [
    { name: "Vedant Joshi", marks: 85 },
    { name: "Yugank Rathore", marks: 92 },
    { name: "Samuel Biju", marks: 78 }
];
students.push({ name: "Aarush Kumar", marks: 88 });
let maxMarks = -1;
let topStudent = "";
for (let i = 0; i < students.length; i++) {
    if (students[i].marks > maxMarks) {
        maxMarks = students[i].marks;
        topStudent = students[i].name;
    }
}
console.log(topStudent + " has the maximum marks: " + maxMarks);
// Yugank Rathore has the maximum marks: 92
