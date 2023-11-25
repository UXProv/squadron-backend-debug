import { User } from "src/modules/auth/user.model";
import { Member } from "./member.model";


export class MemberConverter {

    userToMember(user: User){
        const member = new Member();
        member._id = user.id;
        member.name = user.username;
        member.avatar = user.avatarUrl; 

        return member;
    }
}