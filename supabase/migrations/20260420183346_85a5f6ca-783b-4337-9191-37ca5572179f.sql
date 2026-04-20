CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  delete from auth.users where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.handle_profile_update_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE auth.users
  SET 
    phone = NEW.phone,
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', NEW.full_name)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atualiza_meta_automaticamente()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  if (TG_OP = 'INSERT') then
    if new.type = 'saida' then
      update goals set current_amount = coalesce(current_amount, 0) + new.amount
      where user_id = new.user_id and trim(lower(category)) = trim(lower(new.category));
    end if;
    return new;
  elsif (TG_OP = 'DELETE') then
    if old.type = 'saida' then
      update goals set current_amount = coalesce(current_amount, 0) - old.amount
      where user_id = old.user_id and trim(lower(category)) = trim(lower(old.category));
    end if;
    return old;
  elsif (TG_OP = 'UPDATE') then
    if old.type = 'saida' then
      update goals set current_amount = coalesce(current_amount, 0) - old.amount 
      where user_id = old.user_id and trim(lower(category)) = trim(lower(old.category));
    end if;
    if new.type = 'saida' then
      update goals set current_amount = coalesce(current_amount, 0) + new.amount 
      where user_id = new.user_id and trim(lower(category)) = trim(lower(new.category));
    end if;
    return new;
  end if;
  return null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$function$;