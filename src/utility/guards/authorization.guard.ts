import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, mixin } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

/*    @Injectable()
export class AuthorizeGuard implements CanActivate{

    constructor(private reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean {
        const allowedRoles=this.reflector.get<string[]>('allowedRoles',context.getHandler());
        const request=context.switchToHttp().getRequest();
        const userRoles = request.currentUser.roles || [];
        const result=userRoles.some((role: string) => allowedRoles.includes(role));

        if(result) return true;
        throw new UnauthorizedException('sorry, you are not authorized')
        
    }
} */
export const AuthorizeGuard = (allowedRoles:string[])=>{
    class RolesGuardMixin implements CanActivate{
        canActivate(context: ExecutionContext):boolean{
            const request=context.switchToHttp().getRequest();
            const userRoles = request.currentUser.roles || [];
            const result=userRoles.some((role: string) => allowedRoles.includes(role));
            if(result) return true;
            throw new UnauthorizedException('sorry, you are not authorized')
        }
    }
    const guard=mixin(RolesGuardMixin);
    return guard;
}
