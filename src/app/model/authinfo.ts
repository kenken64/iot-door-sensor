export class AuthInfo {

    constructor(
        public $uid:string,
        public email:string
    ) {

    }
    
    isLoggedIn() {
        return !!this.$uid; 
    }

}