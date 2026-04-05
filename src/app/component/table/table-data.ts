export interface IProduct {
    image: string,
    uname: string,
    gmail: string,
    productName: string,
    status: string,
    weeks: number,
    budget: string
}

export interface ITableRows {
    fname: string,
    lname: string,
    uname: string,
}

export const TopSelling: IProduct[] = [

    {
        image: 'assets/images/users/user1.jpg',
        uname: 'Hanna Gover',
        gmail: 'hgover@gmail.com',
        productName: 'Flexy React',
        status: 'danger',
        weeks: 35,
        budget: '95K'
    },
    {
        image: 'assets/images/users/user2.jpg',
        uname: 'Hanna Gover',
        gmail: 'hgover@gmail.com',
        productName: 'Landing pro React',
        status: 'info',
        weeks: 35,
        budget: '95K'
    },
    {
        image: 'assets/images/users/user3.jpg',
        uname: 'Hanna Gover',
        gmail: 'hgover@gmail.com',
        productName: 'Elite React	',
        status: 'warning',
        weeks: 35,
        budget: '95K'
    },
    {
        image: 'assets/images/users/user4.jpg',
        uname: 'Hanna Gover',
        gmail: 'hgover@gmail.com',
        productName: 'Ample React',
        status: 'success',
        weeks: 35,
        budget: '95K'
    },

]

export const Employee : ITableRows[] = [
    {
        fname: "Mark",
        lname: "Otto",
        uname: "@mdo",
    },
    {
        fname: "Jacob",
        lname: "Thornton",
        uname: "@fat",
    },
    {
        fname: "Larry",
        lname: "the Bird",
        uname: "@twitter",
    }
]